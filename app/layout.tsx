import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || "https";
  const origin = host ? `${protocol}://${host}` : "https://www.gate-ai.eu";
  const socialImage = `${origin}/og.png`;

  return {
    title: "Catena-X Readiness Service | GATE Institute",
    description:
      "A fully EU-funded readiness service helping Bulgarian automotive companies assess eligibility, prepare data and execute Catena-X use cases.",
    icons: {
      icon: "/gate-logo.png",
      shortcut: "/gate-logo.png",
    },
    openGraph: {
      title: "From Bulgarian supplier to Catena-X participant",
      description:
        "Explore a fully supported route into Europe’s automotive data ecosystem with GATE Institute.",
      type: "website",
      images: [{ url: socialImage, width: 1200, height: 630, alt: "Catena-X Readiness Service by GATE Institute" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Catena-X Readiness Service | GATE Institute",
      description:
        "A practical, funded route into Europe’s automotive data ecosystem.",
      images: [socialImage],
    },
  };
}

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
