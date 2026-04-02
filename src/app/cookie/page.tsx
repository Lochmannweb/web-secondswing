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
            Cookies er små tekstfiler, som gemmes på din enhed når du besøger en hjemmeside.
            De hjælper os med at genkende din enhed, huske præferencer og forbedre vores service.
          </p>
        </details>

        <details className="info-section">
          <summary>
            <h2>Vi bruger følgende typer cookies</h2>
          </summary>
          <p>
            <strong>Nødvendige cookies:</strong> Gør det muligt at bruge grundlæggende funktioner
            (fx login og sikkerhed). Disse kan ikke slås fra.
          </p>
          <p>
            <strong>Præference-cookies:</strong> Husker dine valg (fx sprog og region).
          </p>
          <p>
            <strong>Statistik-cookies:</strong> Hjælper os med at forstå hvordan siden bruges
            (fx Google Analytics).
          </p>
          <p>
            <strong>Marketing-cookies:</strong> Bruges til at vise relevante annoncer.
            Tredjepartsleverandører kan bruge dem.
          </p>
        </details>

        <details className="info-section">
          <summary>
            <h2>Sådan styrer du cookies</h2>
          </summary>
          <p>
            Du kan ændre cookie-indstillinger i vores cookie-banner eller via dine
            browser-indstillinger. I appen finder du cookie-indstillinger under
            <strong> Indstillinger &gt; Privatliv</strong>.
          </p>
        </details>
      </Box>
    </Box>
  );
}
