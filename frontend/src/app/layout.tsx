import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mind_Dream — AI E-Commerce Sales, Orders & Support",
  description: "Production-ready AI sales and support agent for TechMart, powered by Gemini and RAG",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#0f111a] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}
