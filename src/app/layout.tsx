import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClientWave",
  description: "Workspace for thoughtful, effective client outreach.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
