import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/app/lib/supabaseServer";

export const revalidate = 0;

type OrderRow = {
  id: string;
  status: string;
  created_at: string;
  listing_id: string;
};

type ListingRow = {
  id: string;
  title: string;
};

export default async function OrdersPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, created_at, listing_id")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10 text-white">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <p className="text-red-400 mb-4">Failed to load orders.</p>
        <pre className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-sm overflow-x-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  const listingIds = [...new Set((orders || []).map((o) => o.listing_id).filter(Boolean))];

  let listingMap = new Map<string, string>();

  if (listingIds.length > 0) {
    const { data: listings } = await supabase
      .from("listings")
      .select("id, title")
      .in("id", listingIds);

    listingMap = new Map(
      ((listings as ListingRow[] | null) || []).map((listing) => [listing.id, listing.title])
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white">My Orders</h1>

        <Link href="/browse" className="text-blue-400 hover:text-blue-300">
          Browse Listings
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
          <p className="text-gray-300">You have no orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(orders as OrderRow[]).map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-gray-800 bg-gray-950 p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {listingMap.get(order.listing_id) || "Listing"}
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    Order ID: {order.id}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-green-400 font-semibold">Order placed</p>

                  <p className="text-sm text-gray-400">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <span className="inline-flex rounded-full border border-gray-700 px-3 py-1 text-sm text-gray-200">
                  Status: {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}