import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "Om os" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/handelsbetingelser", label: "Handelsbetingelser" },
  { href: "/brugervilkar", label: "Brugervilkår" },
  { href: "/privatlivspolitik", label: "Privatlivspolitik" },
  { href: "/cookie", label: "Cookies" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav className="site-footer-nav" aria-label="Footer navigation">
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className="site-footer-link">
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="site-footer-copy">© {new Date().getFullYear()} Second Swing</p>
    </footer>
  );
}
