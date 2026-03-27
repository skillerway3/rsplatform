import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  
  const tables = Object.keys(data.definitions);
  console.log('Tables:', tables);
  if (data.definitions.support_messages) {
    console.log('support_messages:', data.definitions.support_messages.properties);
  }
  if (data.definitions.support_threads) {
    console.log('support_threads:', data.definitions.support_threads.properties);
  }
  if (data.definitions.seller_reviews) {
    console.log('seller_reviews:', data.definitions.seller_reviews.properties);
  }
  if (data.definitions.listings) {
    console.log('listings:', data.definitions.listings.properties);
  }
}
check();
