import { buildWhatsAppUrl } from "../campaign-attribution";
import styles from "./page.module.css";

const whatsappNumber = "5583993325369";
const whatsappMessage =
  "Olá! Gostaria de saber mais sobre o vídeo para minha empresa.";
const whatsappUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);

const portfolio = [
  {
    label: "Turismo",
    title: "Experiências que despertam desejo",
    video: "/assets/videos/turismo-excursoes-3d.mp4",
    poster: "/assets/posters/turismo-excursoes-3d.jpg",
  },
  {
    label: "Serviços",
    title: "Comunicação clara e marcante",
    video: "/assets/videos/dedetizacao-profissional.mp4",
    poster: "/assets/posters/dedetizacao-profissional.jpg",
  },
  {
    label: "Construção civil",
    title: "Autoridade com personalidade",
    video: "/assets/videos/construcao-civil.mp4",
    poster: "/assets/posters/construcao-civil.jpg",
  },
] as const;

const benefits = [
  "Vídeos profissionais e personalizados",
  "Produção rápida com Inteligência Artificial",
  "Conteúdo pronto para anúncios e redes sociais",
] as const;

const process = [
  {
    title: "Você chama no WhatsApp",
    text: "Conta rapidamente o que precisa.",
  },
  {
    title: "Criamos seu vídeo",
    text: "Produzimos o material de forma personalizada.",
  },
  {
    title: "Você recebe pronto para divulgar",
    text: "Ideal para redes sociais e campanhas.",
  },
] as const;

function WhatsAppButton({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <a
      className={styles.whatsappButton}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-whatsapp-cta
    >
      <span>{children}</span>
      <b aria-hidden="true">→</b>
    </a>
  );
}

export default function VideoPublicitarioPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.logo}
          src="/assets/verbovideo-logo-oficial.png"
          alt="VerboVídeo"
          width="110"
          height="62"
        />
      </header>

      <section className={styles.hero} aria-labelledby="landing-title">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" /> Produção publicitária com IA
          </p>
          <h1 id="landing-title">
            Vídeos publicitários com Inteligência Artificial para destacar sua
            empresa.
          </h1>
          <p className={styles.heroText}>
            Criamos vídeos profissionais para anúncios, redes sociais e
            campanhas, com produção rápida e personalizada para sua marca.
          </p>
          <WhatsAppButton>Quero criar meu vídeo</WhatsAppButton>
          <ul className={styles.heroProof} aria-label="Diferenciais da VerboVídeo">
            <li>Produção personalizada</li>
            <li>Atendimento para todo o Brasil</li>
          </ul>
        </div>
      </section>

      <section className={styles.portfolioSection} aria-labelledby="portfolio-title">
        <div className={styles.sectionHeading}>
          <p>PROVA VISUAL</p>
          <h2 id="portfolio-title">Veja alguns vídeos criados pela VerboVídeo.</h2>
          <span>Produções para diferentes empresas, objetivos e mercados.</span>
        </div>

        <div className={styles.portfolioGrid}>
          {portfolio.map((item) => (
            <article className={styles.videoCard} key={item.video}>
              <video
                src={item.video}
                poster={item.poster}
                controls
                playsInline
                preload="none"
                aria-label={`Vídeo publicitário para ${item.label}`}
              />
              <div>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.centeredCta}>
          <WhatsAppButton>Quero um vídeo para minha empresa</WhatsAppButton>
        </div>
      </section>

      <section className={styles.benefitsSection} aria-labelledby="benefits-title">
        <div className={styles.sectionHeading}>
          <p>FEITO PARA SUA MARCA</p>
          <h2 id="benefits-title">Sua empresa com uma apresentação mais forte.</h2>
        </div>
        <div className={styles.benefitGrid}>
          {benefits.map((benefit, index) => (
            <article key={benefit}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{benefit}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.processSection} aria-labelledby="process-title">
        <div className={styles.sectionHeading}>
          <p>COMO FUNCIONA</p>
          <h2 id="process-title">Do primeiro contato ao vídeo pronto.</h2>
        </div>
        <ol className={styles.processGrid}>
          {process.map((step, index) => (
            <li key={step.title}>
              <span>{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-title">
        <p>PRONTO PARA COMEÇAR?</p>
        <h2 id="final-title">Sua empresa merece chamar atenção.</h2>
        <span>
          Fale agora com nossa equipe e descubra como podemos criar um vídeo
          para sua marca.
        </span>
        <WhatsAppButton>Falar agora no WhatsApp</WhatsAppButton>
      </section>

      <footer className={styles.footer}>
        © 2026 VerboVídeo • João Pessoa — PB • Atendimento em todo o Brasil
      </footer>

      <a
        className={styles.mobileWhatsapp}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-whatsapp-cta
      >
        Quero criar meu vídeo <span aria-hidden="true">→</span>
      </a>
    </main>
  );
}
