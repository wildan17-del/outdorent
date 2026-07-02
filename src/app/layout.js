import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import FrapCta from "@/components/FrapCta";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata = {
  title: "Rental Outdoor",
  description: "Sewa perlengkapan outdoor dengan mudah, cepat, dan terpercaya",
  // manifest: "/manifest.json", // commented out — different domain (progressier.app)
  manifest: "https://progressier.app/MvgRQWRxE41SzS1bWPfE/progressier.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <FrapCta />
        </Providers>
        <Script
          src="https://progressier.app/MvgRQWRxE41SzS1bWPfE/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
