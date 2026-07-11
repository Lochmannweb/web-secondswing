export const dynamic = "force-dynamic";

import Image from "next/image";
import { aboutData } from "@/./app/Content/about";
import "./about.css";

export default function AboutPage() {
  const reasons = [
    aboutData.ChooseUs.reasonOne,
    aboutData.ChooseUs.reasonTwo,
    aboutData.ChooseUs.reasonThree,
    aboutData.ChooseUs.reasonFour,
  ];

  return (
    <main className="about-page">
      <section className="hero-page about-hero">
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
          <h1 className="hero-title">{aboutData.Company.title}</h1>
          <p className="hero-subtitle">{aboutData.Company.contentTop}</p>
        </div>
      </section>

      <section className="about-body">
        <div className="about-body-inner">
          <article className="about-block">
            <h2 className="about-block-title">Omkring Second Swing</h2>
            <div className="about-block-text">
              <p>{aboutData.Company.contentMidt}</p>
              <p>{aboutData.Company.contentBottom}</p>
            </div>
          </article>

          <article className="about-block">
            <h2 className="about-block-title">{aboutData.OurMission.title}</h2>
            <div className="about-block-text">
              <p>{aboutData.OurMission.contentTop}</p>
              <p>{aboutData.OurMission.contentMidt}</p>
            </div>
          </article>

          <article className="about-block">
            <h2 className="about-block-title">{aboutData.OurTeam.title}</h2>
            <div className="about-block-text">
              <p>{aboutData.OurTeam.contentTop}</p>
              <p>{aboutData.OurTeam.contentMidt}</p>
            </div>
          </article>

          <article className="about-block about-reasons">
            <h2 className="about-block-title">{aboutData.ChooseUs.title}</h2>
            <div className="about-reasons-grid">
              {reasons.map((reason) => (
                <div key={reason.title} className="about-reason-card">
                  <h3>{reason.title}</h3>
                  <p>{reason.content}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
