import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mnada | Minimal Mono",
  description: "Provisions for the wild. Industrial goods for the modern pioneer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} antialiased selection:bg-[#a58c69] selection:text-white font-[family-name:var(--font-space-mono)]`}>
        {children}
      </body>
    </html>
  );
}
