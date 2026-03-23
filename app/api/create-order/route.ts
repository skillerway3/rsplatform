import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { listingId, requestId, offerId, paypalOrderId } = await req.json();

    if ((!listingId && (!requestId || !offerId)) || !paypalOrderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Get authenticated user server-side
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    let sellerId: string;
    let price: number;
    let title: string;

    if (listingId) {
      // 2a. Fetch listing details
      const { data: listing, error: listingError } = await supabaseAdmin
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listingError || !listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }
      sellerId = listing.seller_id;
      price = listing.price;
      title = listing.title;
    } else {
      // 2b. Fetch offer details
      const { data: offer, error: offerError } = await supabaseAdmin
        .from('buyer_request_offers')
        .select('*, buyer_requests(title)')
        .eq('id', offerId)
        .eq('request_id', requestId)
        .single();

      if (offerError || !offer) {
        return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
      }
      sellerId = offer.seller_id;
      price = offer.price;
      title = offer.buyer_requests?.title || 'Custom Request';
    }

    // 3. Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // 4. Capture the order on the server
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      console.error('PayPal capture error:', errorData);
      return NextResponse.json({ error: 'Failed to capture PayPal order' }, { status: 400 });
    }

    const captureData = await captureResponse.json();
    const paymentId = captureData.id;

    // 5. Thorough Payment Validation
    const captureStatus = captureData.status;
    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json({ error: `Invalid capture status: ${captureStatus}` }, { status: 400 });
    }

    const purchaseUnit = captureData.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const capturedAmount = parseFloat(capture?.amount?.value || '0');
    const capturedCurrency = capture?.amount?.currency_code;

    // Validate amount and currency
    if (Math.abs(capturedAmount - price) > 0.01) {
      return NextResponse.json({ 
        error: 'Payment amount mismatch', 
        details: { expected: price, captured: capturedAmount } 
      }, { status: 400 });
    }

    if (capturedCurrency !== 'USD') {
      return NextResponse.json({ error: 'Currency mismatch' }, { status: 400 });
    }

    // 6. Prevent duplicate order creation
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('payment_id', paymentId)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({ order: existingOrder }, { status: 200 });
    }

    // 7. Create order in Supabase
    const platformFee = Number((price * 0.05).toFixed(2));
    const sellerPayout = Number((price - platformFee).toFixed(2));

    const orderData: any = {
      buyer_id: user.id,
      seller_id: sellerId,
      total_price: price,
      platform_fee: platformFee,
      seller_payout: sellerPayout,
      status: 'processing',
      payment_id: paymentId,
      payment_provider: 'paypal',
      metadata: {
        paypal_details: captureData,
        title: title
      }
    };

    if (listingId) {
      orderData.listing_id = listingId;
    } else {
      orderData.request_id = requestId;
      orderData.offer_id = offerId;
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Supabase order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order in database' }, { status: 500 });
    }

    // 8. If it's a request, update the request status to matched and the offer status to accepted
    if (requestId) {
      await supabaseAdmin
        .from('buyer_requests')
        .update({ status: 'matched' })
        .eq('id', requestId);

      if (offerId) {
        await supabaseAdmin
          .from('buyer_request_offers')
          .update({ status: 'accepted' })
          .eq('id', offerId);
        
        // Reject other offers for this request
        await supabaseAdmin
          .from('buyer_request_offers')
          .update({ status: 'rejected' })
          .eq('request_id', requestId)
          .neq('id', offerId);
      }
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    console.error('Order creation API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
