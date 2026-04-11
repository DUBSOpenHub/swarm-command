import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swarm Command 🐝 — Launch 250+ AI Agents for Multi-Model Consensus",
  description:
    "Launch 50–250+ AI agents across 16 models to solve complex tasks through hierarchical fan-out, cross-family review, and consensus-gated synthesis. One command. Collective intelligence.",
  metadataBase: new URL("https://dubsopenhub.github.io"),
  openGraph: {
    title: "Swarm Command 🐝 — 250 AI Agents. One Command.",
    description:
      "Multi-model consensus intelligence for the Copilot CLI. Launch swarms of AI agents across Claude, GPT, and Gemini to find what no single model can.",
    url: "https://dubsopenhub.github.io/swarm-command/",
    siteName: "Swarm Command",
    type: "website",
    images: [
      {
        url: "/swarm-command/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Swarm Command — Launch 250+ AI agents for multi-model consensus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swarm Command 🐝 — 250 AI Agents. One Command.",
    description:
      "Multi-model consensus intelligence. Launch 250+ agents across 16 models with shadow scoring. Built by @greggcochran.",
    images: ["/swarm-command/og-image.svg"],
  },
  keywords: [
    "AI agents",
    "multi-model",
    "consensus",
    "swarm intelligence",
    "Copilot CLI",
    "GitHub Copilot",
    "shadow scoring",
    "LLM orchestration",
  ],
  authors: [{ name: "Gregg Cochran", url: "https://github.com/greggcochran" }],
  creator: "Gregg Cochran",
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
