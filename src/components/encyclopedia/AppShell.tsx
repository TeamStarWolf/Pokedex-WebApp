import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { GameContextBar } from "./GameContextBar";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { to: "/", label: "Home" },
  { to: "/games", label: "Games" },
  { to: "/dex/national", label: "Pokemon" },
  { to: "/trainers/appearances", label: "Trainer Battles" },
  { to: "/search", label: "Search" },
];

const utilityItems = [
  { to: "/trainers", label: "Trainers" },
  { to: "/regions", label: "Regions" },
  { to: "/moves", label: "Moves" },
  { to: "/abilities", label: "Abilities" },
  { to: "/items", label: "Items" },
  { to: "/locations", label: "Locations" },
  { to: "/compare?left=charizard&right=venusaur", label: "Compare" },
];

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="encyclopedia-shell">
      <header className="site-header">
        <Link to="/" className="brand-lockup">
          <span className="brand-mark">Dx</span>
          <div>
            <strong>Dexcore</strong>
            <span>Pokemon encyclopedia and game guide</span>
          </div>
        </Link>
        <nav className="primary-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-pill ${isActive ? "active" : ""}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/search" className="quick-search-link">
          <Search size={16} />
          Search
        </Link>
      </header>
      <section className="shell-utility-nav" aria-label="Explore">
        {utilityItems.map((item) => (
          <Link key={item.to} to={item.to} className="utility-link">
            {item.label}
          </Link>
        ))}
      </section>
      <GameContextBar />
      {children}
    </div>
  );
}
