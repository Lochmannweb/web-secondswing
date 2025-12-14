// Klient side, der brugerer Sentrys egen ErrorBoundary-komponent til at fange fejl i React-komponenttræet.
// Når en fejl opstår i et af child-komponenterne, stopper React normal rendering og lader Error Boundary overtage.
// Sentry’s ErrorBoundary fanger fejlen, rapporterer den til Sentry og viser den angivne fallback i stedet for at lade hele UI’et bryde sammen.
"use client"

import * as Sentry from "@sentry/nextjs";

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={<div>Der opstod en fejl</div>}
      showDialog
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
