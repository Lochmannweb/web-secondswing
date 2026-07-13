"use client";

import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../profil.css";
import "./indstillinger.css";

type SettingsItem = {
  key: string;
  label: string;
  description: string;
  href: string;
};

type SettingsGroup = {
  key: string;
  label: string;
  items: SettingsItem[];
};

const settingsGroups: SettingsGroup[] = [
  {
    key: "account",
    label: "Konto",
    items: [
      {
        key: "profile",
        label: "Profil & adresse",
        description: "Navn, billede, leveringsadresse og bio",
        href: "/indstillinger/profiloplysninger",
      },
      {
        key: "notifications",
        label: "Notifikationer",
        description: "Vælg hvad du vil modtage in-app og på e-mail",
        href: "/indstillinger/notifikationer",
      },
    ],
  },
  {
    key: "marketplace",
    label: "Køb & salg",
    items: [
      {
        key: "trade",
        label: "Køb, salg & fragt",
        description: "Standard fragt, tilbud og annoncepræferencer",
        href: "/indstillinger/kob-salg",
      },
      {
        key: "payments",
        label: "Betalinger",
        description: "Betalingsmetoder og udbetaling som sælger",
        href: "/indstillinger/betalinger",
      },
    ],
  },
  {
    key: "security",
    label: "Sikkerhed & privatliv",
    items: [
      {
        key: "security",
        label: "Sikkerhed",
        description: "Login, enheder og kontobeskyttelse",
        href: "/indstillinger/sikkerhed",
      },
      {
        key: "privacy",
        label: "Privatliv & data",
        description: "Handelsbetingelser, brugervilkår og privatlivspolitik",
        href: "/indstillinger/privatliv",
      },
    ],
  },
  {
    key: "help",
    label: "Hjælp",
    items: [
      {
        key: "faq",
        label: "Ofte stillede spørgsmål",
        description: "Svar på de mest almindelige spørgsmål",
        href: "/faq",
      },
      {
        key: "contact",
        label: "Kontakt support",
        description: "Få hjælp fra SecondSwing-teamet",
        href: "/kontakt",
      },
    ],
  },
];

export default function Indstillinger() {
  const router = useRouter();

  return (
    <Box className="settings-hub">
      <Button
        onClick={() => router.push("/profile")}
        className="profil-back"
        startIcon={<NavigateBeforeIcon />}
      >
        Tilbage til profil
      </Button>

      <header className="settings-header">
        <p className="settings-kicker">Konto</p>
        <h1 className="settings-title">Indstillinger</h1>
        <p className="settings-hub-intro">
          Administrer profil, notifikationer, betalinger og privatliv.
        </p>
      </header>

      <div className="settings-hub-groups">
        {settingsGroups.map((group) => (
          <section key={group.key} className="settings-hub-group" aria-label={group.label}>
            <h2 className="settings-hub-group-label">{group.label}</h2>
            <ul className="settings-hub-list">
              {group.items.map((item) => (
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
        ))}
      </div>
    </Box>
  );
}
