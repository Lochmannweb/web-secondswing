"use client";

import {
  blockUser,
  disableAllMfa,
  getMfaEnabled,
  loadSecuritySettings,
  repairTwoFactorMetadata,
  REPORT_REASONS,
  saveTwoFactorEnabled,
  searchProfiles,
  startMfaEnroll,
  submitUserReport,
  syncCurrentLoginSession,
  unblockUser,
  verifyMfaEnroll,
  DEVICE_TYPE_LABELS,
  type MfaEnrollData,
  type SecuritySettings,
} from "@/app/lib/securitySettings";
import { getSupabaseClient } from "@/app/lib/supabaseClient";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "../../profil.css";
import "./sikkerhed.css";

function formatDateTime(value: string | null) {
  if (!value) return "Ukendt";
  return new Date(value).toLocaleString("da-DK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SikkerhedPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(
    null
  );
  const [mfaVerified, setMfaVerified] = useState(false);
  const [twoFactorSaving, setTwoFactorSaving] = useState(false);
  const [mfaDialogOpen, setMfaDialogOpen] = useState(false);
  const [mfaEnroll, setMfaEnroll] = useState<MfaEnrollData | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaDialogError, setMfaDialogError] = useState<string | null>(null);
  const [mfaVerifying, setMfaVerifying] = useState(false);

  const [blockQuery, setBlockQuery] = useState("");
  const [blockResults, setBlockResults] = useState<{ id: string; display_name: string | null }[]>([]);
  const [reportQuery, setReportQuery] = useState("");
  const [reportResults, setReportResults] = useState<{ id: string; display_name: string | null }[]>([]);
  const [selectedReportUser, setSelectedReportUser] = useState<{
    id: string;
    display_name: string | null;
  } | null>(null);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(data.user.id);
      await syncCurrentLoginSession(supabase);
      const loaded = await loadSecuritySettings(supabase);
      const mfa = await getMfaEnabled(supabase);

      setSettings(loaded.settings);
      setEmail(loaded.email);
      setLastSignIn(loaded.lastSignIn);
      setMfaVerified(mfa);

      if (mfa && !loaded.settings.twoFactorEnabled) {
        const repairKey = "ss-2fa-metadata-repaired";
        if (!sessionStorage.getItem(repairKey)) {
          await repairTwoFactorMetadata(supabase, loaded.settings);
          sessionStorage.setItem(repairKey, "1");
        }
      }

      setLoading(false);
    };

    init();

    const refreshSessions = async () => {
      if (document.visibilityState !== "visible") return;
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return;
      await syncCurrentLoginSession(supabase);
      const loaded = await loadSecuritySettings(supabase);
      const mfa = await getMfaEnabled(supabase);
      setMfaVerified(mfa);
      setSettings((current) =>
        current
          ? {
              ...current,
              loginSessions: loaded.settings.loginSessions,
              twoFactorEnabled: loaded.settings.twoFactorEnabled,
            }
          : loaded.settings
      );
    };

    document.addEventListener("visibilitychange", refreshSessions);
    return () => document.removeEventListener("visibilitychange", refreshSessions);
  }, [supabase]);

  useEffect(() => {
    if (blockQuery.trim().length < 2) {
      setBlockResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      const results = await searchProfiles(supabase, blockQuery, currentUserId ?? undefined);
      setBlockResults(results);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [blockQuery, currentUserId, supabase]);

  useEffect(() => {
    if (reportQuery.trim().length < 2) {
      setReportResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      const results = await searchProfiles(supabase, reportQuery, currentUserId ?? undefined);
      setReportResults(results);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [reportQuery, currentUserId, supabase]);

  const closeMfaDialog = () => {
    setMfaDialogOpen(false);
    setMfaEnroll(null);
    setMfaCode("");
    setMfaDialogError(null);
    setMfaVerifying(false);
  };

  const openMfaSetup = async () => {
    setMfaDialogOpen(true);
    setMfaDialogError(null);
    setMfaEnroll(null);
    setMfaCode("");

    const { data, error } = await startMfaEnroll(supabase);
    if (error) {
      setMfaDialogError(
        `${error} Du kan stadig gemme præference under — fuld TOTP kræver MFA aktiveret i Supabase.`
      );
      return;
    }
    setMfaEnroll(data);
  };

  const handleVerifyMfa = async () => {
    if (!mfaEnroll || mfaCode.trim().length < 6 || !settings) return;

    setMfaVerifying(true);
    setMfaDialogError(null);

    const { error: verifyError } = await verifyMfaEnroll(
      supabase,
      mfaEnroll.factorId,
      mfaCode
    );

    if (verifyError) {
      setMfaDialogError(verifyError);
      setMfaVerifying(false);
      return;
    }

    const { settings: next, error } = await saveTwoFactorEnabled(supabase, true, settings);
    setMfaVerifying(false);

    if (error) {
      setMfaDialogError(error);
      return;
    }

    setSettings(next);
    setMfaVerified(true);
    closeMfaDialog();
    setMessage({ type: "success", text: "To-faktor godkendelse er aktiveret og verificeret." });
  };

  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (!settings || twoFactorSaving) return;
    setMessage(null);
    setTwoFactorSaving(true);

    if (enabled) {
      setTwoFactorSaving(false);
      await openMfaSetup();
      return;
    }

    const { error: disableError } = await disableAllMfa(supabase);
    if (disableError) {
      setTwoFactorSaving(false);
      setMessage({ type: "error", text: disableError });
      return;
    }

    const { settings: next, error } = await saveTwoFactorEnabled(supabase, false, settings);
    setTwoFactorSaving(false);

    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setSettings(next);
    setMfaVerified(false);
    setMessage({ type: "success", text: "To-faktor godkendelse er slået fra." });
  };

  const handleSavePreferenceOnly = async () => {
    if (!settings) return;
    setTwoFactorSaving(true);
    const { settings: next, error } = await saveTwoFactorEnabled(supabase, true, settings);
    setTwoFactorSaving(false);

    if (error) {
      setMfaDialogError(error);
      return;
    }

    setSettings(next);
    closeMfaDialog();
    setMessage({
      type: "success",
      text: "To-faktor præference er gemt. Fuldfør TOTP-opsætning når MFA er tilgængelig.",
    });
  };

  const handleBlock = async (userId: string, displayName: string) => {
    if (!settings) return;
    setMessage(null);

    const { settings: next, error } = await blockUser(supabase, userId, displayName, settings);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setSettings(next);
    setBlockQuery("");
    setBlockResults([]);
    setMessage({ type: "success", text: `${displayName} er blokeret.` });
  };

  const handleUnblock = async (userId: string) => {
    if (!settings) return;
    const { settings: next, error } = await unblockUser(supabase, userId, settings);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }
    setSettings(next);
  };

  const handleReport = async () => {
    if (!settings || !selectedReportUser) return;
    setMessage(null);

    const { settings: next, error } = await submitUserReport(
      supabase,
      {
        reportedUserId: selectedReportUser.id,
        reportedUserName: selectedReportUser.display_name ?? "Bruger",
        reason: reportReason,
        details: reportDetails.trim(),
      },
      settings
    );

    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setSettings(next);
    setSelectedReportUser(null);
    setReportQuery("");
    setReportDetails("");
    setReportReason(REPORT_REASONS[0]);
    setMessage({
      type: "success",
      text: "Anmeldelsen er sendt. Vi gennemgår den hurtigst muligt.",
    });
  };

  if (loading) {
    return <p className="profile-page-status">Henter sikkerhedsindstillinger...</p>;
  }

  if (!settings || !currentUserId) {
    return (
      <Box className="settings-layout">
        <p className="settings-stub-text">Log ind for at administrere sikkerhed på din konto.</p>
        <Button onClick={() => router.push("/profile")} className="profil-save-button">
          Gå til profil
        </Button>
      </Box>
    );
  }

  const twoFactorActive = settings.twoFactorEnabled || mfaVerified;

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
        <p className="settings-kicker">Sikkerhed & privatliv</p>
        <h1 className="settings-title">Sikkerhed</h1>
      </Box>

      {message && (
        <Alert severity={message.type === "info" ? "info" : message.type} className="profil-alert">
          {message.text}
        </Alert>
      )}

      <div className="security-settings-list">
        <section className="security-card">
          <div className="security-card-head">
            <h2>Login</h2>
            <p>Se hvordan du er logget ind på SecondSwing.</p>
          </div>
          <p className="security-meta">{email ?? "Ukendt e-mail"}</p>
          <p className="security-meta-muted">Logget ind med Google</p>
          <p className="security-meta-muted">Seneste login: {formatDateTime(lastSignIn)}</p>
        </section>

        <section className="security-card">
          <div className="security-card-head">
            <h2>To-faktor godkendelse</h2>
            <p>Ekstra beskyttelse ved login med engangskode.</p>
          </div>
          <div className="security-row">
            <label className="security-toggle">
              <span>Aktivér to-faktor</span>
              <Switch
                checked={twoFactorActive}
                disabled={twoFactorSaving}
                onChange={(event) => handleTwoFactorToggle(event.target.checked)}
                size="small"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#4a7340" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#4a7340",
                  },
                }}
              />
            </label>
            <span className={`security-status${twoFactorActive ? " security-status--on" : ""}`}>
              {twoFactorActive ? "Aktiveret" : "Ikke aktiveret"}
            </span>
          </div>
          {mfaVerified ? (
            <p className="security-meta-muted">Authenticator-app er tilkoblet din konto.</p>
          ) : settings.twoFactorEnabled ? (
            <p className="security-meta-muted">
              Præference gemt — fuldfør opsætning med engangskode-app.
            </p>
          ) : (
            <p className="security-meta-muted">
              Scan en QR-kode med Google Authenticator, Authy eller lignende.
            </p>
          )}
          {!twoFactorActive && (
            <Button className="security-action" onClick={openMfaSetup} disabled={twoFactorSaving}>
              Opsæt to-faktor
            </Button>
          )}
        </section>

        <section className="security-card">
          <div className="security-card-head">
            <h2>Loginaktivitet & enheder</h2>
            <p>
              {settings.loginSessions.length
                ? `Logget ind på ${settings.loginSessions.length} ${
                    settings.loginSessions.length === 1 ? "enhed" : "enheder"
                  }`
                : "Overblik over enheder, du er logget ind på."}
            </p>
          </div>
          {settings.loginSessions.length ? (
            <ul className="security-session-list">
              {settings.loginSessions.map((session) => (
                <li key={session.id} className="security-session-item">
                  <div className="security-session-main">
                    <span
                      className={`security-device-icon security-device-icon--${session.deviceType}`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="security-session-name">
                        {DEVICE_TYPE_LABELS[session.deviceType]}
                      </p>
                      <p className="security-session-meta">
                        {session.browser} · {session.os}
                      </p>
                      <p className="security-session-time">
                        Sidst aktiv: {formatDateTime(session.lastActiveAt)}
                      </p>
                    </div>
                  </div>
                  {session.isCurrent && <span className="security-badge">Denne enhed</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="security-empty">
              Besøg SecondSwing på mobil, iPad eller bærbar mens du er logget ind — så vises
              enhederne her.
            </p>
          )}
        </section>

        <section className="security-card">
          <div className="security-card-head">
            <h2>Bloker brugere</h2>
            <p>Blokerede brugere kan ikke kontakte dig via platformen.</p>
          </div>
          <TextField
            label="Søg bruger at blokere"
            value={blockQuery}
            onChange={(event) => setBlockQuery(event.target.value)}
            fullWidth
            className="security-field"
          />
          {blockResults.length > 0 && (
            <ul className="security-search-results">
              {blockResults.map((profile) => (
                <li key={profile.id}>
                  <Button
                    className="security-search-item"
                    onClick={() =>
                      handleBlock(profile.id, profile.display_name ?? "Bruger")
                    }
                  >
                    Bloker {profile.display_name ?? "Bruger"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {settings.blockedUsers.length ? (
            <ul className="security-block-list">
              {settings.blockedUsers.map((user) => (
                <li key={user.id} className="security-block-item">
                  <div>
                    <p className="security-block-name">{user.displayName}</p>
                    <p className="security-session-time">
                      Blokeret {formatDateTime(user.blockedAt)}
                    </p>
                  </div>
                  <Button
                    className="security-danger"
                    onClick={() => handleUnblock(user.id)}
                  >
                    Fjern
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="security-empty">Du har ingen blokerede brugere.</p>
          )}
        </section>

        <section className="security-card">
          <div className="security-card-head">
            <h2>Anmeld bruger</h2>
            <p>Rapporter mistænkelig adfærd til SecondSwing.</p>
          </div>
          <div className="security-form">
            <TextField
              label="Søg bruger"
              value={reportQuery}
              onChange={(event) => {
                setReportQuery(event.target.value);
                setSelectedReportUser(null);
              }}
              fullWidth
              className="security-field"
            />
            {reportResults.length > 0 && !selectedReportUser && (
              <ul className="security-search-results">
                {reportResults.map((profile) => (
                  <li key={profile.id}>
                    <Button
                      className="security-search-item"
                      onClick={() => {
                        setSelectedReportUser(profile);
                        setReportQuery(profile.display_name ?? "Bruger");
                        setReportResults([]);
                      }}
                    >
                      {profile.display_name ?? "Bruger"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <TextField
              select
              label="Årsag"
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              fullWidth
              className="security-field"
            >
              {REPORT_REASONS.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Detaljer"
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
              fullWidth
              multiline
              minRows={3}
              className="security-field"
            />
            <Button
              className="security-action"
              disabled={!selectedReportUser || reportDetails.trim().length < 10}
              onClick={handleReport}
            >
              Send anmeldelse
            </Button>
          </div>
        </section>

        <section className="security-card">
          <div className="security-card-head">
            <h2>Konto</h2>
            <p>Log ud overalt eller skift adgang via Google.</p>
          </div>
          <Button
            className="security-danger"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
          >
            Log ud
          </Button>
        </section>
      </div>

      <Dialog open={mfaDialogOpen} onClose={closeMfaDialog} fullWidth maxWidth="xs">
        <DialogTitle>To-faktor godkendelse</DialogTitle>
        <DialogContent className="security-mfa-dialog">
          {mfaDialogError && (
            <Alert severity="error" className="profil-alert">
              {mfaDialogError}
            </Alert>
          )}
          {mfaEnroll ? (
            <>
              <p className="security-meta-muted">
                Scan QR-koden med din authenticator-app, og indtast den 6-cifrede kode.
              </p>
              <img
                src={mfaEnroll.qrCode}
                alt="QR-kode til authenticator-app"
                className="security-mfa-qr"
              />
              <p className="security-meta-muted">
                Virker scanning ikke? Indtast nøglen manuelt i din app:
              </p>
              <code className="security-mfa-secret">{mfaEnroll.secret}</code>
              <TextField
                label="Engangskode"
                value={mfaCode}
                onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                fullWidth
                className="security-field"
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              />
            </>
          ) : (
            <p className="security-meta-muted">Forbereder opsætning...</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMfaDialog}>Annuller</Button>
          {mfaEnroll ? (
            <Button
              className="security-action"
              onClick={handleVerifyMfa}
              disabled={mfaVerifying || mfaCode.trim().length < 6}
            >
              {mfaVerifying ? "Verificerer..." : "Bekræft og aktivér"}
            </Button>
          ) : (
            <Button className="security-action" onClick={handleSavePreferenceOnly}>
              Gem præference
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
