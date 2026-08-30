import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://elvinomondi.dev"),
  title: "Elvin Omondi — Software Engineer & Digital Product Builder",
  description:
    "I design and engineer digital products for the web, mobile, desktop and beyond. Step inside the mind of a software engineer.",
  keywords: ["Elvin Omondi", "Software Engineer", "Product Builder", "Creative Developer", "Portfolio", "Next.js", "Systems"],
  authors: [{ name: "Elvin Omondi" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Elvin Omondi — Software Engineer & Digital Product Builder",
    description: "I build software that moves ideas into the real world. Web · Mobile · Desktop · Systems.",
    siteName: "Elvin Omondi",
    type: "website",
    images: [{ url: "/images/og.jpg", width: 1344, height: 768, alt: "Elvin Omondi — Inside the Mind of a Software Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elvin Omondi — Software Engineer",
    description: "I build software that moves ideas into the real world.",
    images: ["/images/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
