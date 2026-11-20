import type { Metadata } from "next";
import { Allura, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createGoogleAnalyticsScript } from "./google-analytics";
import {
  createMetaPixelNoscriptUrl,
  createMetaPixelScript,
} from "./meta-pixel";
import { createOpenAiAdsPixelScript } from "./openai-ads";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const allura = Allura({
  variable: "--font-signature",
  weight: "400",
  subsets: ["latin"],
});

const openAiAdsPixelScript = createOpenAiAdsPixelScript();
const googleAnalyticsScript = createGoogleAnalyticsScript();
const metaPixelScript = createMetaPixelScript();
const metaPixelNoscriptUrl = createMetaPixelNoscriptUrl();

export const metadata: Metadata = {
  title: "VerboVídeo | Vídeos 3D e realistas cinematográficos",
  description:
    "Produtora de vídeos publicitários em João Pessoa–PB. Vídeos 3D, realistas cinematográficos, mascotes, avatares e criativos para empresas de todo o Brasil.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          id="google-analytics-measurement"
          dangerouslySetInnerHTML={{ __html: googleAnalyticsScript }}
        />
        <script
          id="openai-ads-measurement-pixel"
          dangerouslySetInnerHTML={{ __html: openAiAdsPixelScript }}
        />
        <script
          id="meta-pixel-base-code"
          dangerouslySetInnerHTML={{ __html: metaPixelScript }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${allura.variable} antialiased`}
      >
        <noscript>
          {/* Meta's required no-JavaScript fallback must remain a raw image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={metaPixelNoscriptUrl}
            alt=""
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
