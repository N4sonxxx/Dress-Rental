import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "GlamourRent — Party Dress Rentals",
  description:
    "Rent stunning designer party dresses for any occasion. Browse, try on, and rent — hassle-free.",
  keywords: ["party dress rental", "evening gown", "cocktail dress", "prom dress"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`min-h-screen theme-root ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#1a1233",
              color: "#f0e6ff",
              fontSize: "0.875rem",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
