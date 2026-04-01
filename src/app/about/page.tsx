export const dynamic = 'force-dynamic';

import { aboutData } from "@/./app/Content/about"
import "./about.css"

export default function Home() {
  return (
        <main className="about-page">
            <section className="about-layout">
                <div className="about-visual">
                    <div className="about-visual-overlay" />
                    <div className="about-visual-copy">
                        <p className="about-visual-kicker">About</p>
                        <h1>Second Swing</h1>
                    </div>
                </div>

                <aside className="about-panel">
                    <div className="about-panel-scroll">
                        <section className="about-section-block">
                            <h2>Our Company</h2>
                            <p>{aboutData.Company.contentTop}</p>
                            <p>{aboutData.Company.contentMidt}</p>
                            <p>{aboutData.Company.contentBottom}</p>
                        </section>

                        <section className="about-section-block">
                            <h2>Our Mission</h2>
                            <p>{aboutData.OurMission.contentTop}</p>
                            <p>{aboutData.OurMission.contentMidt}</p>
                        </section>

                        <section className="about-section-block">
                            <h2>The Team</h2>
                            <p>{aboutData.OurTeam.contentTop}</p>
                            <p>{aboutData.OurTeam.contentMidt}</p>
                        </section>

                        <section className="about-section-block about-reasons">
                            <h2>Why Choose Us</h2>
                            <div>
                                <h3>{aboutData.ChooseUs.reasonOne.title}</h3>
                                <p>{aboutData.ChooseUs.reasonOne.content}</p>
                            </div>
                            <div>
                                <h3>{aboutData.ChooseUs.reasonTwo.title}</h3>
                                <p>{aboutData.ChooseUs.reasonTwo.content}</p>
                            </div>
                            <div>
                                <h3>{aboutData.ChooseUs.reasonThree.title}</h3>
                                <p>{aboutData.ChooseUs.reasonThree.content}</p>
                            </div>
                            <div>
                                <h3>{aboutData.ChooseUs.reasonFour.title}</h3>
                                <p>{aboutData.ChooseUs.reasonFour.content}</p>
                            </div>
                        </section>
                    </div>
                </aside>
            </section>
        </main>
  );
}
