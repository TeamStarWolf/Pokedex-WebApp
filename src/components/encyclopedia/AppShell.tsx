import { useState, type ReactNode } from "react";
import { Menu, Search } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { GameContextBar } from "./GameContextBar";
import { MobileDrawer } from "./MobileDrawer";

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
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="encyclopedia-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
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
        <Link to="/search" className="quick-search-link" aria-label="Search the encyclopedia">
          <Search size={16} />
          Search
        </Link>
        <button
          type="button"
          className="mobile-menu-trigger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
        >
          <Menu size={20} />
        </button>
      </header>
      <section className="shell-utility-nav" aria-label="Explore">
        {utilityItems.map((item) => (
          <Link key={item.to} to={item.to} className="utility-link">
            {item.label}
          </Link>
        ))}
      </section>
      <GameContextBar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} navItems={navItems} utilityItems={utilityItems} />
      <div id="main-content" />
      {children}
    </div>
  );
}
