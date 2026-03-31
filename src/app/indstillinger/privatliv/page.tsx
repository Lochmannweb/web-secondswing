"use client";

import { Box, Typography } from "@mui/material";

export default function PrivatlivPage() {
  return (
    <Box className="info-page">
      <Box className="info-page-header">
        <Typography variant="overline" className="shop-page-kicker">
          Indstillinger
        </Typography>
        <Typography variant="h3" className="shop-page-title">
          Cookie-politik
        </Typography>
      </Box>

      <Box className="info-page-content">
        <section className="info-section">
          <h2>Hvad er cookies?</h2>
          <p>
            Cookies er sma tekstfiler, som gemmes pa din enhed nar du besoger en hjemmeside.
            De hjaelper os med at genkende din enhed, huske praeferencer og forbedre vores service.
          </p>
        </section>

        <section className="info-section">
          <h2>Vi bruger folgende typer cookies</h2>
          <p><strong>Nodvendige cookies:</strong> <br /> Gor det muligt at bruge grundlaeggende funktioner (fx login og sikkerhed). Disse kan ikke slas fra.</p> <br />
          <p><strong>Praeference-cookies:</strong> <br /> Husker dine valg (fx sprog og region).</p> <br />
          <p><strong>Statistik-cookies:</strong> <br /> Hjaelper os med at forsta hvordan siden bruges (fx Google Analytics).</p> <br />
          <p><strong>Marketing-cookies:</strong> <br /> Bruges til at vise relevante annoncer. Tredjepartsleverandorer kan bruge dem.</p>
        </section>

        <section className="info-section">
          <h2>Sadan styrer du cookies</h2>
          <p>
            Du kan aendre cookie-indstillinger i vores cookie-banner eller via dine browser-indstillinger.
            I appen finder du cookie-indstillinger under <strong>Indstillinger &gt; Privatliv</strong>.
          </p>
        </section>
      </Box>
    </Box>
  );
}
