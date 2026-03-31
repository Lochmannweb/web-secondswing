import { Box, Typography } from "@mui/material";

export default function SaelgerPage() {
  return (
    <Box className="info-page">
      <Box className="info-page-header">
        <Typography variant="overline" className="shop-page-kicker">
          Saelg
        </Typography>
        <Typography variant="h3" className="shop-page-title">
          Saelg dine golfkoller hurtigt og sikkert
        </Typography>
      </Box>

      <Box className="info-page-content">
        <section className="info-section">
          <p>
            Opret en annonce pa fa minutter. Vaelg kategori, tilstand og pris. Vi anbefaler klare billeder,
            aerlig stand-beskrivelse og at inkludere maerke og model.
          </p>
        </section>

        <section className="info-section">
          <h2>Tip til god annonce</h2>
          <p>Tag 4-6 klare billeder fra forskellige vinkler.</p>
          <p>Angiv laengde, grebstorrelse og loft, hvis relevant.</p>
          <p>Beskriv slid, reparationer eller pletter objektivt.</p>
        </section>
      </Box>
    </Box>
  );
}
