import * as Sentry from "@sentry/nextjs";

type ExtraData = Record<string, unknown>;

export function useSentry() {
  const log = (msg: string, extra?: ExtraData) => {
    Sentry.captureMessage(msg, { level: "info", extra });
  };

  const logWarning = (msg: string, extra?: ExtraData) => {
    Sentry.captureMessage(msg, { level: "warning", extra });
  };

  const logError = (error: unknown) => {
    if (error instanceof Error) {
      return Sentry.captureException(error);
    }
    Sentry.captureMessage(String(error), { level: "error" });
  };

  return { log, logWarning, logError };
}
