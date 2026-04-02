import Link from "next/link";
import "./globals.css";

const trustPoints = [
  "Brugt golfudstyr samlet ét sted",
  "Gratis oprettelse af annoncer",
  // "Hurtig browsing på mobil og desktop",
];

const categories = [
  {
    title: "Bags",
    description: "Giv godt udstyr en ny runde i stedet for at lade det stå i skuret.",
  },
  {
    title: "Køller og jern",
    description: "Find drivers, wedges og komplette sæt uden at betale nypris.",
  },
  {
    title: "Tøj og tilbehør",
    description: "Søg efter brugte golfstyles, handsker og småting til næste runde.",
  },
];

const steps = [
  {
    title: "Opret annonce",
    description: "Upload billede, tilføj pris og beskrivelse, og gå live på få minutter.",
  },
  {
    title: "Bliv fundet",
    description: "Købere kan browse uden login og filtrere produkter med det samme.",
  },
  {
    title: "Aftal handel",
    description: "Brug favoritter og produktsider til at holde styr på interessante varer.",
  },
];

export default function Home() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="landing-hero-video"
        >
          <source src="/Golf_Man_Video_3840x2160.mp4" type="video/mp4" />
        </video>
        <div className="landing-hero-overlay" />
        <div className="landing-hero-content">
          <p className="landing-eyebrow">Brugt golfudstyr - klar til et Second Swing</p>
          <h1>Gør det nemt at købe og sælge golfudstyr i Danmark</h1>
          <div className="landing-trust-grid">
            {trustPoints.map((point) => (
              <div key={point} className="landing-trust-card">
                {point}
              </div>
            ))}
          </div>
          {/* <p className="landing-lead">
            En enkel markedsplads bygget til spillere,
            der vil finde kvalitet, spare penge og få udstyr videre hurtigt.
          </p> */}

          <div className="landing-actions">
            <Link href="/shop" className="landing-primary-link">
              Gå til shop
            </Link>
            <Link href="/opretProdukt" className="landing-secondary-link">
              Opret annonce
            </Link>
          </div>
        </div>

        <section className="landing-section">
          <div className="landing-section-heading">
            <p className="landing-section-kicker">Udvalgte kategorier</p>
            <h2>Udstyr til golfspillere</h2>
          </div>

          <div className="landing-card-grid">
            {categories.map((category) => (
              <article key={category.title} className="landing-info-card">
                <h3>{category.title}</h3>
                <p className="desktop-only-dots">........................</p>
                <p>{category.description}</p>
              </article>
            ))}
          </div>
        </section>
      </section>



      {/* <section className="landing-section landing-section-alt">
        <div className="landing-section-heading">
          <p className="landing-section-kicker">Sådan virker det</p>
          <h2>Det vigtigste er fart og enkelhed, så siden kan gå live nu.</h2>
        </div>

        <div className="landing-steps-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="landing-step-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta-panel">
        <div>
          <p className="landing-section-kicker">Klar til launch</p>
          <h2>Få de første produkter online og begynd at teste efterspørgslen.</h2>
        </div>
        <Link href="/about" className="landing-secondary-link">
          Læs om Second Swing
        </Link>
      </section> */}
    </main>
  );
}