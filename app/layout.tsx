import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <nav className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-blue-500">
            RSPlatform
          </Link>

          <div className="flex gap-6 items-center">
            <Link href="/" className="hover:text-blue-400">
              Browse
            </Link>
            <Link href="/sell" className="hover:text-blue-400">
              Sell
            </Link>
            <Link href="/support" className="hover:text-blue-400">
              Support
            </Link>

            <div className="flex gap-2">
              <Link href="/login">
                <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                  Login
                </button>
              </Link>

              <Link href="/register">
                <button className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition">
                  Register
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
