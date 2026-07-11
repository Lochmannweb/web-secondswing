"use client";

import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import "../../profil.css";

export default function BetalingerPage() {
  const router = useRouter();

  return (
    <Box className="settings-layout">
      <Button
        onClick={() => router.push("/indstillinger")}
        className="profil-back"
        startIcon={<NavigateBeforeIcon />}
      >
        Tilbage
      </Button>

      <Box className="settings-header">
        <p className="settings-kicker">Køb & salg</p>
        <h1 className="settings-title">Betalinger</h1>
      </Box>

      <p className="settings-stub-text">
        Her administrerer du betalingsmetoder til køb og udbetaling som sælger.
      </p>

      <ul className="settings-stub-list">
        <li>Tilføj betalingskort</li>
        <li>Tilføj bankkonto til udbetaling</li>
        <li>Se kvitteringer og betalingshistorik</li>
      </ul>
    </Box>
  );
}
