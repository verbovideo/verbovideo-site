"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  buildWhatsAppUrl,
  captureCampaignAttribution,
} from "./campaign-attribution";
import { trackGoogleAnalyticsFormLead } from "./google-analytics";
import { trackMetaPixelLead } from "./meta-pixel";
import { trackOpenAiAdsLead } from "./openai-ads";

const instagramUrl = "https://www.instagram.com/verbovideo/";
const whatsappNumber = "5583993325369";
const generalWhatsappMessage =
  "Olá, equipe da VerboVídeo! Vim pelo site e gostaria de conversar sobre um vídeo para minha empresa.";

const inclusions = [
  "Qualidade profissional",
  "Roteiro e locução",
  "Opções padrão e personalizadas",
  "Acompanhamento em cada etapa",
];

const services = [
  {
    number: "01",
    title: "Vídeos publicitários em 3D",
    text: "Personagens, cenários e histórias que tornam sua mensagem mais envolvente, memorável e comercial.",
  },
  {
    number: "02",
    title: "Realismo cinematográfico",
    text: "Produções com atmosfera de cinema, direção visual e acabamento pensado para valorizar a sua marca.",
  },
  {
    number: "03",
    title: "Mascotes e avatares",
    text: "Personagens que dão rosto, voz, presença e personalidade à comunicação da sua empresa.",
  },
  {
    number: "04",
    title: "Criativos para anúncios",
    text: "Vídeos planejados para prender atenção nos primeiros segundos e conduzir o público à ação.",
  },
  {
    number: "05",
    title: "Vídeos institucionais",
    text: "Apresentações mais profundas para fortalecer autoridade, história, propósito e diferenciais.",
  },
  {
    number: "06",
    title: "Projetos sob medida",
    text: "Cada roteiro, cenário, personagem e ritmo é criado de acordo com o objetivo do seu negócio.",
  },
];

const portfolio = [
  {
    title: "Excursões que começam no vídeo",
    category: "Turismo",
    style: "Animação 3D cinematográfica",
    duration: "30s",
    video: "/assets/videos/turismo-excursoes-3d.mp4",
    poster: "/assets/posters/turismo-excursoes-3d.jpg",
  },
  {
    title: "Experiências que despertam desejo",
    category: "Turismo",
    style: "Campanha para agência de viagens",
    duration: "55s",
    video: "/assets/videos/turismo-agencia.mp4",
    poster: "/assets/posters/turismo-agencia.jpg",
  },
  {
    title: "Histórias que atravessam o tempo",
    category: "Cinematográfico",
    style: "Storytelling emocional",
    duration: "40s",
    video: "/assets/videos/narrativa-cinematografica.mp4",
    poster: "/assets/posters/narrativa-cinematografica.jpg",
  },
  {
    title: "Emoção em linguagem de cinema",
    category: "Cinematográfico",
    style: "Realismo cinematográfico",
    duration: "15s",
    video: "/assets/videos/video-emocional.mp4",
    poster: "/assets/posters/video-emocional.jpg",
  },
  {
    title: "Turismo com atmosfera de cinema",
    category: "Turismo",
    style: "Experiência em catamarã",
    duration: "58s",
    video: "/assets/videos/turismo-catamara.mp4",
    poster: "/assets/posters/turismo-catamara.jpg",
  },
  {
    title: "Destino internacional em movimento",
    category: "Turismo",
    style: "Campanha de viagem ao Chile",
    duration: "57s",
    video: "/assets/videos/turismo-chile.mp4",
    poster: "/assets/posters/turismo-chile.jpg",
  },
  {
    title: "Experiências inesquecíveis",
    category: "Turismo",
    style: "Parque temático em 3D",
    duration: "35s",
    video: "/assets/videos/turismo-parque-tematico.mp4",
    poster: "/assets/posters/turismo-parque-tematico.jpg",
  },
  {
    title: "Resorts que viram desejo",
    category: "Turismo",
    style: "Campanha de lazer e hospedagem",
    duration: "73s",
    video: "/assets/videos/turismo-resort.mp4",
    poster: "/assets/posters/turismo-resort.jpg",
  },
  {
    title: "Prevenção com impacto visual",
    category: "Controle de pragas",
    style: "Serviço residencial",
    duration: "68s",
    video: "/assets/videos/controle-pragas-residencial.mp4",
    poster: "/assets/posters/controle-pragas-residencial.jpg",
  },
  {
    title: "Mobilidade com personalidade",
    category: "Outros segmentos",
    style: "Mascote e transformação 3D",
    duration: "47s",
    video: "/assets/videos/mobilidade-aplicativo.mp4",
    poster: "/assets/posters/mobilidade-aplicativo.jpg",
  },
  {
    title: "Construção civil com autoridade",
    category: "Construção civil",
    style: "Mascote empresarial em 3D",
    duration: "36s",
    video: "/assets/videos/construcao-civil.mp4",
    poster: "/assets/posters/construcao-civil.jpg",
  },
  {
    title: "Controle de pragas profissional",
    category: "Controle de pragas",
    style: "Campanha de dedetização",
    duration: "44s",
    video: "/assets/videos/dedetizacao-profissional.mp4",
    poster: "/assets/posters/dedetizacao-profissional.jpg",
  },
  {
    title: "Higienização que gera confiança",
    category: "Outros segmentos",
    style: "Limpeza de reservatórios",
    duration: "26s",
    video: "/assets/videos/higienizacao-reservatorios.mp4",
    poster: "/assets/posters/higienizacao-reservatorios.jpg",
  },
  {
    title: "Cuidado animal que conquista",
    category: "Outros segmentos",
    style: "Pet shop e estética animal em 3D",
    duration: "39s",
    video: "/assets/videos/petshop-estetica-animal.mp4",
    poster: "/assets/posters/petshop-estetica-animal.jpg",
  },
  {
    title: "Momentos que ficam para sempre",
    category: "Cinematográfico",
    style: "Produção cinematográfica de casamento",
    duration: "35s",
    video: "/assets/videos/cinematografico-casamento.mp4",
    poster: "/assets/posters/cinematografico-casamento.jpg",
  },
  {
    title: "Uma viagem cheia de experiências",
    category: "Turismo",
    style: "Campanha para excursão nacional",
    duration: "37s",
    video: "/assets/videos/turismo-rainha-da-paz.mp4",
    poster: "/assets/posters/turismo-rainha-da-paz.jpg",
  },
  {
    title: "LP Turismo",
    category: "Turismo",
    style: "Campanha para agência de turismo",
    duration: "40s",
    video: "/assets/videos/turismo-lp.mp4",
    poster: "/assets/posters/turismo-lp.jpg",
  },
  {
    title: "JRV Turismo",
    category: "Turismo",
    style: "Vídeo institucional para transporte turístico",
    duration: "40s",
    video: "/assets/videos/turismo-jrv.mp4",
    poster: "/assets/posters/turismo-jrv.jpg",
  },
  {
    title: "Unlock Learning Center",
    category: "Educação",
    style: "Mascote educacional em 3D",
    duration: "62s",
    video: "/assets/videos/educacao-unlock.mp4",
    poster: "/assets/posters/educacao-unlock.jpg",
  },
  {
    title: "SNS Viagens e Turismo",
    category: "Turismo",
    style: "Campanha para agência de viagens",
    duration: "50s",
    video: "/assets/videos/turismo-sns.mp4",
    poster: "/assets/posters/turismo-sns.jpg",
  },
  {
    title: "ChrisTur Viagens e Turismo",
    category: "Turismo",
    style: "Campanha turística em 3D",
    duration: "63s",
    video: "/assets/videos/turismo-christur.mp4",
    poster: "/assets/posters/turismo-christur.jpg",
  },
  {
    title: "Walttravel",
    category: "Turismo",
    style: "Campanha para agência de viagens",
    duration: "32s",
    video: "/assets/videos/turismo-walttravel.mp4",
    poster: "/assets/posters/turismo-walttravel.jpg",
  },
  {
    title: "Control Dedetizadora",
    category: "Controle de pragas",
    style: "Mascote empresarial em 3D",
    duration: "71s",
    video: "/assets/videos/controle-pragas-control.mp4",
    poster: "/assets/posters/controle-pragas-control.jpg",
  },
  {
    title: "Força Máxima Dedetizadora",
    category: "Controle de pragas",
    style: "Campanha de controle de pragas",
    duration: "45s",
    video: "/assets/videos/controle-pragas-forca-maxima.mp4",
    poster: "/assets/posters/controle-pragas-forca-maxima.jpg",
  },
  {
    title: "Mandecas Tur Viagens",
    category: "Turismo",
    style: "Campanha para os Lençóis Maranhenses",
    duration: "32s",
    video: "/assets/videos/turismo-mandecas.mp4",
    poster: "/assets/posters/turismo-mandecas.jpg",
  },
  {
    title: "Léo Tour",
    category: "Turismo",
    style: "Viagens, transfer e turismo",
    duration: "47s",
    video: "/assets/videos/turismo-leo-tour.mp4",
    poster: "/assets/posters/turismo-leo-tour.jpg",
  },
  {
    title: "Léo Tour — Transfers",
    category: "Turismo",
    style: "Campanha para transfer turístico",
    duration: "35s",
    video: "/assets/videos/turismo-leo-tour-transfer.mp4",
    poster: "/assets/posters/turismo-leo-tour-transfer.jpg",
  },
  {
    title: "Boto da Amazônia",
    category: "Turismo",
    style: "Safari amazônico com mascote 3D",
    duration: "118s",
    video: "/assets/videos/turismo-boto-amazonia.mp4",
    poster: "/assets/posters/turismo-boto-amazonia.jpg",
  },
  {
    title: "Maria José Excursões",
    category: "Turismo",
    style: "Campanha para excursões",
    duration: "36s",
    video: "/assets/videos/turismo-maria-jose.mp4",
    poster: "/assets/posters/turismo-maria-jose.jpg",
  },
] as const;

type PortfolioItem = (typeof portfolio)[number];

const filters = [
  "Todos",
  "Turismo",
  "Controle de pragas",
  "Construção civil",
  "Cinematográfico",
  "Educação",
  "Outros segmentos",
];

const packages = [
  {
    id: "essencial-30",
    name: "Vídeo Essencial 30s",
    duration: "30 segundos • 1 mascote",
    price: "197",
    oldPrice: null,
    badge: "PARA COMEÇAR",
    description:
      "Para empresas que querem divulgar produtos ou serviços com um mascote próprio, qualidade profissional e acabamento de cinema.",
    features: [
      "1 mascote ou avatar personalizado",
      "Até 6 cenas",
      "Roteiro e locução profissional",
      "Edição, trilha e identidade visual",
      "Até 3 ajustes no vídeo",
    ],
    featured: false,
    whatsappMessage:
      "Olá, equipe da VerboVídeo! Vim pelo site e tenho interesse no Vídeo Essencial de 30 segundos por R$ 197.",
  },
  {
    id: "profissional-30",
    name: "Vídeo Profissional 30s",
    duration: "30 segundos • até 2 personagens",
    price: "297",
    oldPrice: null,
    badge: "MAIS ESCOLHIDO",
    description:
      "Uma cena com diálogo entre personagens criados para a sua marca, pensada para anúncios que prendem a atenção.",
    features: [
      "Até 2 personagens personalizados",
      "Cenas livres com diálogo",
      "Roteiro de anúncio com gancho nos 3 primeiros segundos",
      "Locução, edição, trilha e identidade visual",
      "Imagem do mascote em PNG para as redes",
      "Até 5 ajustes no vídeo",
    ],
    featured: true,
    whatsappMessage:
      "Olá, equipe da VerboVídeo! Vim pelo site e tenho interesse no Vídeo Profissional de 30 segundos com até 2 personagens por R$ 297.",
  },
  {
    id: "profissional-60",
    name: "Vídeo Profissional 60s",
    duration: "60 segundos • até 3 personagens",
    price: "497",
    oldPrice: null,
    badge: "APRESENTAÇÃO COMPLETA",
    description:
      "Mais tempo para desenvolver a apresentação da empresa, do produto ou serviço com profundidade e força comercial.",
    features: [
      "Até 3 personagens personalizados",
      "Cenas livres com diálogo",
      "Roteiro aprofundado",
      "Locução, edição, trilha e identidade visual",
      "Imagem do mascote em PNG para as redes",
      "Até 8 ajustes no vídeo",
    ],
    featured: false,
    whatsappMessage:
      "Olá, equipe da VerboVídeo! Vim pelo site e tenho interesse no Vídeo Profissional de 60 segundos com até 3 personagens por R$ 497.",
  },
];

type Testimonial = {
  quote: string;
  name: string;
  company: string;
  result?: string;
};

// Depoimentos reais, publicados com autorização do cliente.
// Enquanto a lista estiver vazia, o bloco de depoimentos não aparece no site.
const testimonials: Testimonial[] = [];

const faqs = [
  {
    question: "O que preciso enviar para começar?",
    answer:
      "Logomarca, WhatsApp, Instagram, principais serviços, objetivo do vídeo e os materiais que deseja utilizar, como fotos e vídeos.",
  },
  {
    question: "O mascote está incluso?",
    answer:
      "Sim, em todos os formatos. O Essencial inclui 1 mascote ou avatar personalizado, o Profissional 30s inclui até 2 personagens e o Profissional 60s até 3. Personagens adicionais recebem orçamento conforme o projeto.",
  },
  {
    question: "Qual é o prazo de produção?",
    answer:
      "A entrega acontece em até 3 dias úteis após a confirmação da entrada, o recebimento das informações e a aprovação do roteiro.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "No Pix, 50% na entrada e 50% somente após a aprovação final. No cartão, o pagamento é feito no início e pode ser dividido em até 3 vezes sem juros.",
  },
  {
    question: "Posso pedir alterações?",
    answer:
      "Sim. O Essencial inclui até 3 ajustes, o Profissional 30s até 5 e o Profissional 60s até 8, mantendo o roteiro e os personagens já aprovados.",
  },
];

function PricingSection({
  packageWhatsappLinks,
}: {
  packageWhatsappLinks: Record<string, string>;
}) {
  return (
    <section className="pricing-section" id="formatos">
      <div className="pricing-heading">
        <p className="section-kicker">ESCOLHA O FORMATO IDEAL</p>
        <h2>Qualidade profissional em três opções bem definidas.</h2>
        <p>
          Todos os formatos incluem mascote personalizado. Escolha quantos
          personagens a sua história precisa. Se tiver dúvida, nossa equipe
          orienta você pelo WhatsApp.
        </p>
      </div>
      <div className="pricing-grid three-columns">
        {packages.map((item) => (
          <article
            className={"price-card " + (item.featured ? "featured-light" : "")}
            key={item.id}
          >
            <span className="popular-badge">{item.badge}</span>
            <p className="price-name">{item.name}</p>
            <h3>{item.duration}</h3>
            <p className="price-description">{item.description}</p>
            <div
              className="price-value"
              aria-label={
                item.oldPrice
                  ? `De R$ ${item.oldPrice} por R$ ${item.price}`
                  : `R$ ${item.price}`
              }
            >
              <span className="price-label">INVESTIMENTO</span>
              {item.oldPrice ? (
                <del className="price-old" aria-hidden="true">
                  R$ {item.oldPrice}
                </del>
              ) : null}
              <div className="price-current" aria-hidden="true">
                <strong>
                  <small>R$</small>
                  {item.price}
                </strong>
              </div>
              <small className="price-caption">por vídeo</small>
            </div>
            <ul>
              {item.features.map((feature) => (
                <li key={feature}>
                  <span>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
              className="plan-whatsapp-cta"
              href={packageWhatsappLinks[item.id]}
              target="_blank"
              rel="noreferrer"
              aria-label={`Falar no WhatsApp sobre ${item.name} por R$ ${item.price}`}
            >
              Quero este vídeo no WhatsApp <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
      </div>
      <div className="payment-strip">
        <div>
          <strong>PIX</strong>
          <span>50% na entrada e 50% após a aprovação final</span>
        </div>
        <i />
        <div>
          <strong>CARTÃO</strong>
          <span>Pagamento no início em até 3x sem juros</span>
        </div>
        <i />
        <div>
          <strong>PROJETO MAIOR?</strong>
          <span>Vídeos acima de 60s recebem orçamento personalizado</span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [selectedPackage, setSelectedPackage] = useState(
    "Vídeo Profissional — 30 segundos — até 2 personagens — R$ 297",
  );
  const [requestSent, setRequestSent] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selectedVideo, setSelectedVideo] = useState<PortfolioItem | null>(null);
  const [attribution, setAttribution] = useState<Record<string, string>>({});

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAttribution(captureCampaignAttribution());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const whatsappLink = useMemo(
    () => buildWhatsAppUrl(whatsappNumber, generalWhatsappMessage, attribution),
    [attribution],
  );

  const packageWhatsappLinks = useMemo(
    () =>
      Object.fromEntries(
        packages.map((item) => [
          item.id,
          buildWhatsAppUrl(whatsappNumber, item.whatsappMessage, attribution),
        ]),
      ),
    [attribution],
  );

  const visiblePortfolio = useMemo(() => {
    const matchingPortfolio =
      activeFilter === "Todos"
        ? portfolio
        : portfolio.filter((item) => item.category === activeFilter);

    return [...matchingPortfolio].sort(
      (first, second) =>
        filters.indexOf(first.category) - filters.indexOf(second.category),
    );
  }, [activeFilter]);

  useEffect(() => {
    if (!selectedVideo) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedVideo(null);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedVideo]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get("name")?.toString() ?? "";
    const company = data.get("company")?.toString() ?? "";
    const clientWhatsapp = data.get("whatsapp")?.toString() ?? "";
    const service = data.get("service")?.toString() ?? "";
    const message = data.get("message")?.toString() ?? "";
    const body = [
      "Olá, equipe da VerboVídeo! Meu nome é " + name + ".",
      company ? "Empresa: " + company + "." : "",
      clientWhatsapp ? "Meu WhatsApp: " + clientWhatsapp + "." : "",
      "Tenho interesse em: " + service + ".",
      message ? "Quero divulgar: " + message : "",
    ]
      .filter(Boolean)
      .join("\n");

    setRequestSent(true);
    trackGoogleAnalyticsFormLead({
      formName: "home_contact_form",
      selectedFormat: service,
    });
    trackOpenAiAdsLead();
    trackMetaPixelLead();
    window.open(
      buildWhatsAppUrl(whatsappNumber, body, captureCampaignAttribution()),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <>
      <main>
        <header className="site-header">
          <a className="official-brand" href="#inicio" aria-label="VerboVídeo, início">
            <img
              src="/assets/verbovideo-logo-oficial.png"
              alt="VerboVídeo"
            />
          </a>

          <nav className="desktop-nav" aria-label="Navegação principal">
            <a href="#servicos">Serviços</a>
            <a href="#portfolio">Portfólio</a>
            <a href="#resultados">Resultados</a>
            <a href="#formatos">Investimento</a>
            <a href="#sobre">Nossa história</a>
          </nav>

          <div className="header-socials">
            <a
              className="social-link instagram-link"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              Instagram <span aria-hidden="true">↗</span>
            </a>
            <a
              className="social-link whatsapp-link"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp <span aria-hidden="true">↗</span>
            </a>
          </div>
        </header>

        <section className="hero" id="inicio">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="hero-copy">
            <p className="eyebrow">
              <span /> Estúdio criativo de IA cinematográfica
            </p>
            <h1>
              Sua marca merece ser <em>vista, lembrada</em> e escolhida.
            </h1>
            <p className="hero-description">
              Transformamos ideias em vídeos 3D e realistas cinematográficos
              que conectam, valorizam seu negócio e despertam no cliente a
              vontade de agir.
            </p>
            <p className="hero-price-callout">
              Vídeos profissionais para sua empresa <strong>a partir de R$ 197.</strong>
              <span>Todos com mascote personalizado, de 1 a 3 personagens.</span>
            </p>

            <div className="hero-actions">
              <a
                className="button button-primary"
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp <span aria-hidden="true">→</span>
              </a>
              <a
                className="button button-secondary"
                href="#formatos"
              >
                Ver opções e valores <span aria-hidden="true">↓</span>
              </a>
            </div>

            <ul className="inclusion-list" aria-label="Itens inclusos">
              {inclusions.map((item) => (
                <li key={item}>
                  <span aria-hidden="true">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-visual">
            <div className="hero-reel">
              <div className="reel-heading">
                <span className="pulse-dot" />
                TRABALHO REAL • VERBOVÍDEO
              </div>
              <div className="reel-video-shell">
                <video
                  src="/assets/videos/turismo-excursoes-3d.mp4"
                  poster="/assets/posters/turismo-excursoes-3d.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Exemplo de vídeo 3D produzido pela VerboVídeo"
                />
                <button
                  className="reel-open"
                  type="button"
                  onClick={() => setSelectedVideo(portfolio[0])}
                >
                  <span aria-hidden="true">▶</span> Assistir com som
                </button>
              </div>
              <div className="reel-footer">
                <div>
                  <strong>3D + CINEMA</strong>
                  <span>Produção personalizada</span>
                </div>
                <span className="reel-number">01 / 16</span>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-bar" aria-label="Diferenciais da VerboVídeo">
          <div>
            <strong>A PARTIR DE R$ 197</strong>
            <span>opções para cada objetivo</span>
          </div>
          <i />
          <div>
            <strong>MASCOTE EM TODOS OS FORMATOS</strong>
            <span>você escolhe o formato</span>
          </div>
          <i />
          <div>
            <strong>DO ROTEIRO À ENTREGA</strong>
            <span>produção completa</span>
          </div>
          <i />
          <div>
            <strong>ATÉ 3 DIAS ÚTEIS</strong>
            <span>prazo de entrega</span>
          </div>
        </section>

        <section className="work-section" id="portfolio">
          <div className="work-heading">
            <div>
              <p className="section-kicker light">PORTFÓLIO VERBOVÍDEO</p>
              <h2>Trabalhos reais. Resultados que começam pela imagem.</h2>
            </div>
            <p>
              Selecione uma categoria e clique em qualquer projeto para assistir
              ao vídeo completo.
            </p>
          </div>

          <div className="portfolio-filters" role="group" aria-label="Filtrar portfólio">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter}
                className={activeFilter === filter ? "active" : ""}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="work-grid">
            {visiblePortfolio.map((item) => (
              <button
                className="work-card"
                type="button"
                key={item.video}
                onClick={() => setSelectedVideo(item)}
                aria-label={"Assistir ao vídeo " + item.title}
              >
                <img src={item.poster} alt="" loading="lazy" />
                <span className="work-duration">{item.duration}</span>
                <span className="work-play" aria-hidden="true">▶</span>
                <span className="work-gradient" />
                <span className="work-copy">
                  <small>{item.category}</small>
                  <strong>{item.title}</strong>
                  <em>{item.style}</em>
                </span>
              </button>
            ))}
          </div>

          <div className="portfolio-note">
            <span>Quer acompanhar nossos trabalhos mais recentes?</span>
            <a href={instagramUrl} target="_blank" rel="noreferrer">
              Ver portfólio no Instagram <b aria-hidden="true">→</b>
            </a>
          </div>
        </section>

        <PricingSection packageWhatsappLinks={packageWhatsappLinks} />

        <section className="results-section" id="resultados">
          <div className="results-heading">
            <p className="section-kicker">RESULTADOS</p>
            <h2>Marcas de vários segmentos já confiam na VerboVídeo.</h2>
            <p>
              Cada projeto do portfólio é um trabalho real, feito para uma
              empresa real, com roteiro, locução e acabamento pensados para
              gerar resultado.
            </p>
          </div>
          <div className="results-stats">
            <div>
              <strong>{portfolio.length}</strong>
              <span>projetos no portfólio</span>
            </div>
            <div>
              <strong>{filters.length - 1}</strong>
              <span>segmentos atendidos</span>
            </div>
            <div>
              <strong>3 dias</strong>
              <span>úteis para a entrega</span>
            </div>
            <div>
              <strong>100% online</strong>
              <span>clientes no Brasil e no exterior</span>
            </div>
          </div>
          {testimonials.length > 0 ? (
            <div className="testimonial-grid">
              {testimonials.map((item) => (
                <figure className="testimonial-card" key={item.name + item.company}>
                  {item.result ? (
                    <p className="testimonial-result">{item.result}</p>
                  ) : null}
                  <blockquote>“{item.quote}”</blockquote>
                  <figcaption>
                    <strong>{item.name}</strong>
                    <span>{item.company}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </section>

        <section className="process-section" id="processo">
          <div className="process-copy">
            <p className="section-kicker light">SIMPLES, SEGURO E TRANSPARENTE</p>
            <h2>Você acompanha e aprova cada etapa.</h2>
            <p>
              Seu projeto avança com alinhamento, direção e cuidado em cada
              detalhe da sua marca.
            </p>
            <a
              className="button button-primary"
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              Iniciar meu projeto <span>→</span>
            </a>
          </div>
          <ol className="process-list">
            <li>
              <span>01</span>
              <div>
                <h3>Entendemos seu objetivo</h3>
                <p>Recebemos as informações, materiais e o que o vídeo precisa alcançar.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Criamos o roteiro</h3>
                <p>A mensagem é organizada com clareza, estratégia e chamada para ação.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Você aprova o personagem</h3>
                <p>O mascote ou avatar é apresentado antes da produção completa.</p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>Produzimos e finalizamos</h3>
                <p>O vídeo recebe animação, locução, edição, trilha e acabamento final.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="story-section" id="sobre">
          <div className="story-mark" aria-hidden="true">
            <img src="/assets/verbovideo-logo-oficial.png" alt="" />
            <span>PUBLICIDADE EM AÇÃO</span>
          </div>
          <div className="story-copy">
            <p className="section-kicker">NOSSA HISTÓRIA</p>
            <h2>Um sonho que nasceu da fé e ganhou movimento.</h2>
            <p className="story-lead">
              A VerboVídeo nasceu da visão de Carla Gonçalves — uma mulher
              determinada e sonhadora, cristã, mãe e empreendedora. Entre
              madrugadas de ideias, conversas com Deus e orações por direção,
              um sonho ganhou forma, propósito e nome.
            </p>
            <p>
              O nome VerboVídeo é inspirado em Cristo, o Verbo da Vida, e traduz
              a essência da marca: dar voz, movimento e significado a mensagens
              que precisam alcançar pessoas.
            </p>
            <p>
              O que começou como uma ideia cresceu passo a passo. Hoje, de João
              Pessoa, na Paraíba, a VerboVídeo conquista a confiança de pequenos,
              médios e grandes empresários, com projetos realizados em todo o
              Brasil e também fora dele.
            </p>
            <div className="founder-signature">
              <strong>Carla Gonçalves</strong>
              <span>Fundadora da VerboVídeo</span>
            </div>
          </div>
        </section>

        <section className="vox-section" aria-labelledby="vox-title">
          <div className="vox-visual">
            <img
              src="/assets/vox.png"
              alt="Vox, o falcão da VerboVídeo"
              width="1254"
              height="1254"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="vox-copy">
            <h2 id="vox-title">VOX — Visão para criar. Precisão para entregar.</h2>
            <p>
              O Vox representa a essência da VerboVídeo: enxergar além, criar
              com propósito e entregar cada projeto com precisão. Inspirado na
              visão, velocidade e força do falcão, ele simboliza a nossa busca
              constante por produções que façam marcas serem vistas, lembradas
              e escolhidas.
            </p>
            <p className="vox-statement">
              Visão estratégica. Execução precisa. Resultado que ganha alcance.
            </p>
          </div>
        </section>

        <section className="faq-section">
          <div className="faq-heading">
            <p className="section-kicker">DÚVIDAS FREQUENTES</p>
            <h2>Tudo o que você precisa saber antes de começar.</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0}>
                <summary>
                  {faq.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contato">
          <div className="contact-copy">
            <p className="section-kicker light">VAMOS COLOCAR SUA MARCA EM MOVIMENTO?</p>
            <h2>Vamos transformar sua ideia em um vídeo?</h2>
            <p>Fale com a VerboVídeo e conte o que sua marca precisa.</p>
            <div className="contact-points">
              <div>
                <span>✓</span>
                <p>
                  <strong>Orientação personalizada</strong>
                  Indicamos o formato ideal para seu objetivo.
                </p>
              </div>
              <div>
                <span>✓</span>
                <p>
                  <strong>Atendimento nacional</strong>
                  Produção online de João Pessoa para todo o Brasil.
                </p>
              </div>
              <div>
                <span>✓</span>
                <p>
                  <strong>Contato direto</strong>
                  Sua solicitação chega à nossa equipe pelo WhatsApp.
                </p>
              </div>
            </div>
            <div className="contact-socials">
              <a href={whatsappLink} target="_blank" rel="noreferrer">
                WhatsApp <span>↗</span>
              </a>
              <a href={instagramUrl} target="_blank" rel="noreferrer">
                Instagram <span>↗</span>
              </a>
            </div>
            <a className="contact-email" href="mailto:verbovideo7@gmail.com">
              verbovideo7@gmail.com <span>↗</span>
            </a>
          </div>
          <div className="contact-vibo">
            <img
              src="/assets/vibo-2.png"
              alt="Vibo 2.0, personagem digital da VerboVídeo"
              width="1254"
              height="1254"
              loading="lazy"
              decoding="async"
            />
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-title">
              <span>01</span>
              <div>
                <strong>Conte um pouco sobre o projeto</strong>
                <p>Vamos preparar sua mensagem para o WhatsApp.</p>
              </div>
            </div>
            <div className="form-row">
              <label>
                Seu nome
                <input
                  name="name"
                  type="text"
                  placeholder="Como podemos chamar você?"
                  required
                />
              </label>
              <label>
                Empresa
                <input name="company" type="text" placeholder="Nome da sua empresa" />
              </label>
            </div>
            <div className="form-row">
              <label>
                Seu WhatsApp
                <input
                  name="whatsapp"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  required
                />
              </label>
              <label>
                Formato de interesse
                <select
                  name="service"
                  value={selectedPackage}
                  onChange={(event) => setSelectedPackage(event.target.value)}
                >
                  <option>Vídeo Essencial — 30 segundos — 1 mascote — R$ 197</option>
                  <option>Vídeo Profissional — 30 segundos — até 2 personagens — R$ 297</option>
                  <option>Vídeo Profissional — 60 segundos — até 3 personagens — R$ 497</option>
                  <option>Projeto acima de 60 segundos</option>
                  <option>Ainda não sei qual escolher</option>
                </select>
              </label>
            </div>
            <label>
              O que você deseja divulgar?
              <textarea
                name="message"
                rows={4}
                placeholder="Produto, serviço, promoção ou objetivo principal..."
              />
            </label>
            <button className="form-submit" type="submit">
              Continuar no WhatsApp <span aria-hidden="true">→</span>
            </button>
            {requestSent && (
              <p className="form-success" role="status">
                Abrimos o WhatsApp com sua mensagem preparada.
              </p>
            )}
            <p className="form-privacy">
              Seus dados serão usados somente para atender à sua solicitação.
            </p>
          </form>
        </section>

        <section className="services-intro" id="servicos">
          <div className="section-heading-row">
            <div>
              <p className="section-kicker">CONTEÚDO QUE GERA MOVIMENTO</p>
              <h2>
                Não fazemos apenas vídeos.
                <br />
                Criamos motivos para o seu cliente escolher você.
              </h2>
            </div>
            <p className="section-side-copy">
              Estratégia, criatividade e tecnologia para transformar a mensagem
              da sua empresa em uma experiência visual.
            </p>
          </div>
          <div className="service-preview-grid">
            {services.map((service) => (
              <article key={service.number}>
                <span>{service.number}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <i aria-hidden="true">↗</i>
              </article>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          <div className="footer-top">
            <a className="footer-brand" href="#inicio" aria-label="Voltar ao início">
              <img src="/assets/verbovideo-logo-oficial.png" alt="VerboVídeo" />
            </a>
            <p>
              Publicidade em ação por meio de vídeos que conectam marcas e
              pessoas.
            </p>
            <div className="footer-socials">
              <a href={instagramUrl} target="_blank" rel="noreferrer">
                Instagram ↗
              </a>
              <a href={whatsappLink} target="_blank" rel="noreferrer">
                WhatsApp ↗
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 VerboVídeo. Todos os direitos reservados.</span>
            <span>João Pessoa — Paraíba • Atendimento em todo o Brasil</span>
          </div>
        </footer>

        <a
          className="mobile-sticky-cta"
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
        >
          Falar no WhatsApp <span>→</span>
        </a>
      </main>

      {selectedVideo && (
        <div
          className="video-modal"
          role="dialog"
          aria-modal="true"
          aria-label={"Vídeo: " + selectedVideo.title}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedVideo(null);
          }}
        >
          <div className="video-modal-panel">
            <button
              className="video-modal-close"
              type="button"
              onClick={() => setSelectedVideo(null)}
              aria-label="Fechar vídeo"
            >
              ×
            </button>
            <div className="video-modal-player">
              <video
                src={selectedVideo.video}
                poster={selectedVideo.poster}
                controls
                autoPlay
                playsInline
              />
            </div>
            <div className="video-modal-copy">
              <span>{selectedVideo.category}</span>
              <h2>{selectedVideo.title}</h2>
              <p>{selectedVideo.style}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
