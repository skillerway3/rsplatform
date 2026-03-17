import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 10; // cache for 10s (fast for mobile)

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  game: string | null;
  created_at: string;
};

function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function BrowsePage() {
  const supabase = getSupabaseServer();

  // ✅ Only fetch what we need + LIMIT (huge speed win)
  const { data, error } = await supabase
    .from("listings")
    .select("id,title,description,price,game,created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(24);

  const listings = (!error && data ? (data as Listing[]) : []) ?? [];

  return (
    <main className="px-6 py-10 md:px-12 max-w-6xl mx-auto">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Browse Listings</h1>
          <p className="mt-1 text-sm text-gray-400">
            Showing latest {listings.length} listings
          </p>
        </div>

        <Link
          href="/sell"
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-white hover:border-gray-500 transition"
        >
          Create Listing
        </Link>
      </div>

      {error ? (
        <p className="mt-6 text-red-400">Failed to load listings.</p>
      ) : listings.length === 0 ? (
        <p className="mt-6 text-gray-400">No active listings yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {listings.map((item) => (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description ?? ""}
              price={`$${Number(item.price).toFixed(2)}`}
              game={item.game ?? ""}
            />
          ))}
        </div>
      )}

      {/* Simple next step for later: pagination / load more */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Tip: We can add “Load more” pagination next.
      </div>
    </main>
  );
}

function Card({
  id,
  title,
  description,
  price,
  game,
}: {
  id: string;
  title: string;
  description: string;
  price: string;
  game: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
      <h2 className="text-gray-100 font-semibold">{title}</h2>

      {game && <p className="text-xs text-gray-500 mt-1">{game}</p>}

      {description && (
        <p className="text-gray-400 text-sm mt-2 line-clamp-2">{description}</p>
      )}

      <p className="text-green-400 mt-3">{price}</p>

      <Link
        href={`/listing/${id}`}
        className="mt-4 block w-full text-center bg-blue-600 hover:bg-blue-500 rounded-lg py-2 text-sm font-semibold"
      >
        View
      </Link>
    </div>
  );
}
