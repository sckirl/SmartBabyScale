import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EPOSREM - Neonatal Monitoring",
  description: "IoT Based Neonatal Monitoring System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
