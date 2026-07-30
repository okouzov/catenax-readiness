import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
const siteOrigin = siteBasePath
  ? "https://okouzov.github.io"
  : "https://www.gate-ai.eu";
const siteUrl = `${siteOrigin}${siteBasePath}/`;
const socialImage = `${siteOrigin}${siteBasePath}/og.png`;
const gateIcon = `${siteBasePath}/gate-logo.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Catena-X Readiness Service | GATE Institute",
  description:
    "A fully EU-funded readiness service helping Bulgarian automotive companies assess eligibility, prepare data and execute Catena-X use cases.",
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: gateIcon,
    shortcut: gateIcon,
  },
  openGraph: {
    title: "From Bulgarian supplier to Catena-X participant",
    description:
      "Explore a fully supported route into Europe’s automotive data ecosystem with GATE Institute.",
    type: "website",
    url: siteUrl,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "Catena-X Readiness Service by GATE Institute",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catena-X Readiness Service | GATE Institute",
    description:
      "A practical, funded route into Europe’s automotive data ecosystem.",
    images: [socialImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
