import Link from "next/link";

export default function HomePage() {
  return (
    <main className="px-6 py-12 md:px-12">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-8 shadow-sm">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm text-gray-300">RSPlatform — Buy & Sell safely</p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">
                The marketplace for RuneScape services & items
              </h1>

              <p className="mt-4 text-gray-300 leading-relaxed">
                Browse listings, create offers, and manage everything from your dashboard.
                Built for fast trades and a clean experience.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/browse"
                  className="rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Browse Listings
                </Link>

                <Link
                  href="/sell"
                  className="rounded-lg border border-gray-700 px-5 py-3 text-white font-semibold hover:border-gray-500 transition"
                >
                  Create Listing
                </Link>
              </div>

              <div className="mt-6 flex gap-6 text-sm text-gray-400">
                <div>
                  <p className="font-semibold text-gray-200">Fast</p>
                  <p>Simple listings flow</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-200">Safe</p>
                  <p>Dashboard control</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-200">Clean</p>
                  <p>Modern UI</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[420px]">
              <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                <p className="text-sm text-gray-400">Quick links</p>

                <div className="mt-4 grid gap-3">
                  <Link
                    href="/browse"
                    className="rounded-xl border border-gray-800 p-4 hover:border-gray-600 transition"
                  >
                    <p className="font-semibold">Browse</p>
                    <p className="text-sm text-gray-400">See all listings</p>
                  </Link>

                  <Link
                    href="/dashboard/my-listings"
                    className="rounded-xl border border-gray-800 p-4 hover:border-gray-600 transition"
                  >
                    <p className="font-semibold">Dashboard</p>
                    <p className="text-sm text-gray-400">Manage your listings</p>
                  </Link>

                  <Link
                    href="/support"
                    className="rounded-xl border border-gray-800 p-4 hover:border-gray-600 transition"
                  >
                    <p className="font-semibold">Support</p>
                    <p className="text-sm text-gray-400">Get help</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
