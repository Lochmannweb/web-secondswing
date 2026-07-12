"use client";

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  saveNotificationPreferences,
  type NotificationChannelPrefs,
  type NotificationPreferences,
} from "@/app/lib/notifications";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { Alert, Box, Button, Switch } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "../../profil.css";
import "./notifikationer.css";

type PrefRow = {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
};

const PREF_ROWS: PrefRow[] = [
  {
    key: "messages",
    label: "Beskeder",
    description: "Nye chatbeskeder og svar fra købere og sælgere.",
  },
  {
    key: "offers",
    label: "Tilbud",
    description: "Bud på dine annoncer og opdateringer om forhandlinger.",
  },
  {
    key: "products",
    label: "Annoncer",
    description: "Status på dine annoncer, salg og favorit-produkter.",
  },
  {
    key: "marketing",
    label: "Nyheder & tips",
    description: "Inspiration, guides og tilbud fra SecondSwing.",
  },
];

function ChannelToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="notification-pref-channel">
      <span>{label}</span>
      <Switch
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        size="small"
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": { color: "#4a7340" },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#4a7340",
          },
        }}
      />
    </label>
  );
}

export default function NotifikationsIndstillingerPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setLoading(false);
        return;
      }

      const raw = data.user.user_metadata?.notification_preferences;
      setPreferences(
        raw && typeof raw === "object"
          ? {
              messages: {
                in_app: raw.messages?.in_app ?? DEFAULT_NOTIFICATION_PREFERENCES.messages.in_app,
                email: raw.messages?.email ?? DEFAULT_NOTIFICATION_PREFERENCES.messages.email,
              },
              offers: {
                in_app: raw.offers?.in_app ?? DEFAULT_NOTIFICATION_PREFERENCES.offers.in_app,
                email: raw.offers?.email ?? DEFAULT_NOTIFICATION_PREFERENCES.offers.email,
              },
              products: {
                in_app: raw.products?.in_app ?? DEFAULT_NOTIFICATION_PREFERENCES.products.in_app,
                email: raw.products?.email ?? DEFAULT_NOTIFICATION_PREFERENCES.products.email,
              },
              marketing: {
                in_app: raw.marketing?.in_app ?? DEFAULT_NOTIFICATION_PREFERENCES.marketing.in_app,
                email: raw.marketing?.email ?? DEFAULT_NOTIFICATION_PREFERENCES.marketing.email,
              },
            }
          : DEFAULT_NOTIFICATION_PREFERENCES
      );
      setLoading(false);
    };

    load();
  }, [supabase]);

  const updatePref = (
    key: keyof NotificationPreferences,
    channel: keyof NotificationChannelPrefs,
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const { error } = await saveNotificationPreferences(supabase, preferences);

    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setMessage({ type: "success", text: "Dine notifikationsindstillinger er gemt." });
  };

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
        <p className="settings-kicker">Indstillinger</p>
        <h1 className="settings-title">Notifikationer</h1>
      </Box>

      <p className="notification-settings-intro">
        Vælg hvordan du vil modtage opdateringer. In-app notifikationer vises i klokken øverst
        på siden og under din profil.
      </p>

      {message && (
        <Alert severity={message.type} className="profil-alert">
          {message.text}
        </Alert>
      )}

      {loading ? (
        <p className="notification-empty">Henter indstillinger...</p>
      ) : (
        <div className="notification-settings-list">
          {PREF_ROWS.map((row) => (
            <section key={row.key} className="notification-settings-card">
              <div className="notification-settings-card-head">
                <h2>{row.label}</h2>
                <p>{row.description}</p>
              </div>
              <div className="notification-settings-card-toggles">
                <ChannelToggle
                  label="In-app"
                  checked={preferences[row.key].in_app}
                  onChange={(value) => updatePref(row.key, "in_app", value)}
                />
                <ChannelToggle
                  label="E-mail"
                  checked={preferences[row.key].email}
                  onChange={(value) => updatePref(row.key, "email", value)}
                />
              </div>
            </section>
          ))}
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={saving || loading}
        className="profil-save-button"
      >
        {saving ? "Gemmer..." : "Gem indstillinger"}
      </Button>
    </Box>
  );
}
