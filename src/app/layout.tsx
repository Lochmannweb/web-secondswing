// Server side 
import HeaderMenu from "@/app/components/Navigation/HeaderMenu";
import "./globals.css";
import ErrorBoundary from "./ErrorBoundary";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <HeaderMenu />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
