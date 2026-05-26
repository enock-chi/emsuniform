import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "PHOC – Uniform Order",
  description: "PHOC uniform order and tracking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div style={{ background: '#FFF3CD', borderBottom: '2px solid #FFC107', padding: '16px 20px', textAlign: 'center', color: '#856404' }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 500, lineHeight: 1.5 }}>
            Please note: All submissions will be stopped on <strong>Friday, May 29th at 10:00 PM</strong>. We kindly ask that you complete all your submissions by then. Thank you!
          </p>
        </div>
        {children}
      </body>
    </html>
  );
}


