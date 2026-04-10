import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swarm Command 🐝 — Multi-Model Consensus Intelligence",
  description:
    "Launch 50–250+ AI agents across 16 models to solve complex tasks through hierarchical fan-out, cross-family review, and consensus-gated synthesis. One command. Collective intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="scanlines">{children}</body>
    </html>
  );
}
