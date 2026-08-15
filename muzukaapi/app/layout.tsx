import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muzuka API",
  description: "Music streaming platform backend API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  );
}
