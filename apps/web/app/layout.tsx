import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community Lead Assistant",
  description: "Find high-intent community leads, score buyer intent, and draft manual outreach safely.",
  metadataBase: new URL("https://communityleadassistant.com")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
