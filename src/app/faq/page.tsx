"use client";

import "./faq.css";

const faqItems = [
  {
    question: "Hvordan betaler jeg for en vare?",
    answer:
      "Aftal betaling direkte med sælger. I fremtiden tilbyder vi sikre betalingsløsninger gennem platformen, så følg med i app-opdateringer.",
  },
  {
    question: "Hvad koster det at sælge?",
    answer: "Vi tager en kommission på 10% af salgsprisen.",
  },
  {
    question: "Hvordan vurderer jeg stand?",
    answer:
      "Vælg fra: Ny, Meget fin, God, Brugbar. Beskriv alt slid og tag flere billeder.",
  },
  {
    question: "Hvordan håndterer I persondata?",
    answer:
      "Se vores Privatlivspolitik. Du kan altid anmode om at få dine data slettet.",
  },
  {
    question: "Hvordan kontakter jeg support?",
    answer:
      "Send en e-mail til secondswing@gmail.com eller brug kontaktformularen på siden.",
  },
];

type FaqPageProps = {
  embedded?: boolean;
};

function FaqList({ itemClassName }: { itemClassName: string }) {
  return (
    <>
      {faqItems.map((item) => (
        <details key={item.question} className={itemClassName}>
          <summary>
            <h2>{item.question}</h2>
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </>
  );
}

export default function FaqPage({ embedded = false }: FaqPageProps) {
  if (embedded) {
    return (
      <div className="info-page">
        <div className="info-page-header">
          <p className="settings-kicker">FAQ</p>
        </div>
        <div className="info-page-content">
          <FaqList itemClassName="info-section" />
        </div>
      </div>
    );
  }

  return (
    <div className="faq-page">
      <header className="faq-header">
        <p className="faq-kicker">Hjælp</p>
        <h1 className="faq-title">Ofte stillede spørgsmål</h1>
        <p className="faq-intro">
          Svar på de mest almindelige spørgsmål om køb, salg og brug af SecondSwing.
        </p>
      </header>

      <div className="faq-list">
        <FaqList itemClassName="faq-item" />
      </div>
    </div>
  );
}
