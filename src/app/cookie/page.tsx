"use client";

import { Box, Typography } from "@mui/material";

export default function CookiePage() {
  return (
    <Box className="info-page">
      <Box className="info-page-header">
        <Typography variant="overline" className="shop-page-kicker">
          Cookie Politik
        </Typography>
      </Box>

      <Box className="info-page-content">
        <details className="info-section">
          <summary>
            <h2>Hvad er cookies?</h2>
          </summary>
          <p>
            Cookies er sma tekstfiler, som gemmes pa din enhed nar du besoger en hjemmeside.
            De hjaelper os med at genkende din enhed, huske praeferencer og forbedre vores service.
          </p>
        </details>

        <details className="info-section">
          <summary>
            <h2>Vi bruger folgende typer cookies</h2>
          </summary>
          <p>
            <strong>Nodvendige cookies:</strong> Gor det muligt at bruge grundlaeggende funktioner
            (fx login og sikkerhed). Disse kan ikke slas fra.
          </p>
          <p>
            <strong>Praeference-cookies:</strong> Husker dine valg (fx sprog og region).
          </p>
          <p>
            <strong>Statistik-cookies:</strong> Hjaelper os med at forsta hvordan siden bruges
            (fx Google Analytics).
          </p>
          <p>
            <strong>Marketing-cookies:</strong> Bruges til at vise relevante annoncer.
            Tredjepartsleverandorer kan bruge dem.
          </p>
        </details>

        <details className="info-section">
          <summary>
            <h2>Sadan styrer du cookies</h2>
          </summary>
          <p>
            Du kan aendre cookie-indstillinger i vores cookie-banner eller via dine
            browser-indstillinger. I appen finder du cookie-indstillinger under
            <strong> Indstillinger &gt; Privatliv</strong>.
          </p>
        </details>
      </Box>
    </Box>
  );
}
