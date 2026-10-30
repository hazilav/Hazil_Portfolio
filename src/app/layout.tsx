import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hazil | Digital Marketer & Web Designer",
  description:
    "Portfolio of Hazil, digital marketer and web designer specializing in SEO, WordPress/Elementor, responsive web design, content creation, and Meta Ads.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full flex flex-col bg-[#0b132b] text-slate-100 font-sans">{children}</body>
    </html>
  );
}
