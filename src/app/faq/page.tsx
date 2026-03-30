"use client";

import { Box, Typography } from "@mui/material";

export default function FaqPage() {
  return (
    <Box className="info-page">
      <Box className="info-page-header">
        <Typography variant="overline" className="shop-page-kicker">
          Hjaelp
        </Typography>
        <Typography variant="h3" className="shop-page-title">
          FAQ
        </Typography>
      </Box>

      <Box className="info-page-content">
        <section className="info-section">
          <h2>Hvordan betaler jeg for en vare?</h2>
          <p>
            Aftal betaling direkte med saelger. I fremtiden tilbyder vi sikre betalingslosninger
            gennem platformen, sa folg med i app-opdateringer.
          </p>
        </section>

        <section className="info-section">
          <h2>Hvad koster det at saelge?</h2>
          <p>Vi tager en kommission pa 10% af salgsprisen.</p>
        </section>

        <section className="info-section">
          <h2>Hvordan vurderer jeg stand?</h2>
          <p>
            Vaelg fra: Ny, Meget fin, God, Brugbar. Beskriv alt slid og tag flere billeder.
          </p>
        </section>

        <section className="info-section">
          <h2>Hvordan handterer I persondata?</h2>
          <p>
            Se vores Privatlivspolitik. Du kan altid anmode om at fa dine data slettet.
          </p>
        </section>

        <section className="info-section">
          <h2>Hvordan kontakter jeg support?</h2>
          <p>
            Send en e-mail til support@secondswing.dk eller brug kontaktformularen pa siden.
          </p>
        </section>
      </Box>
    </Box>
  );
}
