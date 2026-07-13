"use client";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Box, Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../../profil.css";
import "../indstillinger.css";

const legalItems = [
  {
    key: "trade-terms",
    label: "Handelsbetingelser",
    description: "Vilkår for køb og salg på platformen",
    href: "/indstillinger/handelsbetingelser",
  },
  {
    key: "terms-of-use",
    label: "Brugervilkår",
    description: "Regler for brug af Second Swing",
    href: "/indstillinger/brugervilkar",
  },
  {
    key: "privacy-policy",
    label: "Privatlivspolitik",
    description: "Sådan behandler vi dine personoplysninger",
    href: "/indstillinger/privatlivspolitik",
  },
  {
    key: "cookies",
    label: "Cookiepolitik",
    description: "Cookies og hvordan du styrer dem",
    href: "/indstillinger/cookies",
  },
  {
    key: "faq",
    label: "Ofte stillede spørgsmål",
    description: "Svar på de mest almindelige spørgsmål",
    href: "/faq",
  },
];

export default function PrivatlivPage() {
  const router = useRouter();

  return (
    <Box className="settings-hub">
      <Button
        onClick={() => router.push("/indstillinger")}
        className="profil-back"
        startIcon={<NavigateBeforeIcon />}
      >
        Tilbage
      </Button>

      <header className="settings-header">
        <p className="settings-kicker">Sikkerhed & privatliv</p>
        <h1 className="settings-title">Privatliv & data</h1>
        <p className="settings-hub-intro">
          Læs vilkår, privatlivspolitik og andre juridiske dokumenter.
        </p>
      </header>

      <section className="settings-hub-group" aria-label="Juridiske dokumenter">
        <h2 className="settings-hub-group-label">Dokumenter</h2>
        <ul className="settings-hub-list">
          {legalItems.map((item) => (
            <li key={item.key}>
              <Link href={item.href} className="settings-hub-link">
                <span className="settings-hub-link-text">
                  <span className="settings-hub-link-title">{item.label}</span>
                  <span className="settings-hub-link-desc">{item.description}</span>
                </span>
                <ChevronRightIcon className="settings-hub-link-icon" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Box>
  );
}
