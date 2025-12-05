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
