import Link from "next/link";
import { supabaseServer } from "@/app/lib/supabaseServer";
import BuyAndContact from "./BuyAndContact";
import PayPalButton from "./PayPalButton";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  game: string | null;
  created_at: string;
  user_id: string | null;
};

export const revalidate = 0;

export default async function ListingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id } = await params;

  if (!id) {
    return <p className="p-10">Invalid listing id</p>;
  }

  console.log("LISTING PAGE ID:", id);

  const { data, error } = await supabase
    .from("listings")
    .select("id,title,description,price,game,created_at,user_id")
    .eq("id", id)
    .single();

  console.log("LISTING FETCH RESULT:", { data, error });

  if (error || !data) {
    return <p className="p-10">Listing not found</p>;
  }

  const listing = data as Listing;

  return (
    <main className="px-6 py-10 max-w-3xl mx-auto">
      <Link href="/browse" className="text-blue-400">
        ← Back to browse
      </Link>

      <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-6">
        <h1 className="text-2xl font-bold text-white">{listing.title}</h1>

        {listing.game && (
          <p className="text-gray-400 mt-2">{listing.game}</p>
        )}

        <p className="text-green-400 text-xl mt-4">
          ${Number(listing.price).toFixed(2)}
        </p>

        <p className="text-gray-300 mt-6">
          {listing.description || "No description"}
        </p>

        <BuyAndContact
          listingId={listing.id}
          sellerId={listing.user_id}
        />

        <div className="mt-6">
          <p className="text-sm text-gray-400 mb-2">
            Pay securely with PayPal
          </p>

          <PayPalButton
            listingId={listing.id}
            amount={Number(listing.price)}
            buyerId={user?.id || ""}
          />
        </div>

        <p className="text-xs text-gray-500 mt-3">
          This creates a pending order. Payments/escrow come next.
        </p>
      </div>
    </main>
  );
}