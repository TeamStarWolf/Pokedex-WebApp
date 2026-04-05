import { Link } from "react-router-dom";

const footerLinks = [
  { label: "National Dex", to: "/dex/national" },
  { label: "Games", to: "/games" },
  { label: "Trainers", to: "/trainers/appearances" },
  { label: "Moves", to: "/moves" },
  { label: "Abilities", to: "/abilities" },
  { label: "Types", to: "/types" },
  { label: "Regions", to: "/regions" },
  { label: "Items", to: "/items" },
  { label: "Locations", to: "/locations" },
  { label: "Search", to: "/search" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark brand-mark-sm">PN</span>
          <div>
            <strong>PokeNav</strong>
            <span>Pokemon encyclopedia and game guide</span>
          </div>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link key={link.to} to={link.to} className="footer-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="footer-legal">
          Pokemon is a trademark of Nintendo, Game Freak, and Creatures Inc. This is a fan project and is not affiliated with or endorsed by them.
        </p>
      </div>
    </footer>
  );
}
