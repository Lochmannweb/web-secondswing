import { Box, Typography } from "@mui/material";

export default function KontaktPage() {
  return (
    <Box className="info-page">
      <Box className="info-page-header">
        <Typography variant="overline" className="shop-page-kicker">
          Kontakt
        </Typography>
        <Typography variant="h3" className="shop-page-title">
          Kontakt os
        </Typography>
      </Box>

      <Box className="info-page-content">
        <section className="info-section">
          <p>
            Har du sporgsmal, forslag eller brug for hjaelp? Skriv til os pa
            <strong> support@secondswing.dk</strong> eller brug kontaktformularen.
          </p>
        </section>
      </Box>
    </Box>
  );
}
