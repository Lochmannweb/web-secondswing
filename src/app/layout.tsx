// Server side 

import "./globals.css";
import ErrorBoundary from "../../ErrorBoundary";
import { Providers } from "./providers";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Providers>{children}</Providers> 
        </ErrorBoundary>
      </body>
    </html>
  );
}
