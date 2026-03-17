import type { ReactNode } from "react";
import "./globals.css";
import NavBar from "./components/NavBar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
