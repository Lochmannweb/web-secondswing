"use client";

import { Box, Typography } from "@mui/material";

export default function FaqPage() {
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
        "Send en e-mail til support@secondswing.dk eller brug kontaktformularen på siden.",
    },
  ];

  return (
    <Box className="info-page">
      <Box className="info-page-header">
        <Typography variant="overline" className="shop-page-kicker">
          FAQ
        </Typography>
      </Box>

      <Box className="info-page-content">
        {faqItems.map((item) => (
          <details key={item.question} className="info-section">
            <summary>
              <h2>{item.question}</h2>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </Box>
    </Box>
  );
}
