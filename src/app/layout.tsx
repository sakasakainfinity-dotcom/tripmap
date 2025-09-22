export const metadata = { title: "TripMap", description: "Travel memories map" };

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-black">{children}</body>
    </html>
  );
}

