import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vídeos publicitários com IA | VerboVídeo",
  description:
    "Vídeos publicitários profissionais para anúncios, redes sociais e campanhas, com produção rápida e personalizada para sua marca.",
  alternates: {
    canonical: "/video-publicitario",
  },
  openGraph: {
    title: "Vídeos publicitários com IA | VerboVídeo",
    description:
      "Produção rápida e personalizada de vídeos para anúncios, redes sociais e campanhas.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function VideoPublicitarioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
