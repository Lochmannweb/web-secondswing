import Image from "next/image";

export default function Home() {
  return (
    <main className="hero-page">
      <Image
        src="/golf-bg.jpg"
        alt=""
        fill
        priority
        className="hero-bg-image"
        sizes="100vw"
      />
      <div className="hero-overlay" />

      <div className="hero-content">
        <h1 className="hero-title">Tradition på tee&apos;en</h1>
        <p className="hero-subtitle">
          Dem, der handler her, gør det jævnligt. Ikke for opmærksomhed, men for
          udstyret i sig selv.
        </p>
      </div>
    </main>
  );
}
