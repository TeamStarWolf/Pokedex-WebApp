import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Menu, Search } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { GameContextBar } from "./GameContextBar";
import { MobileDrawer } from "./MobileDrawer";
import { ScrollToTop } from "./ScrollToTop";
import { SiteFooter } from "./SiteFooter";

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
  const [scrolled, setScrolled] = useState(false);
  const [utilityMenuOpen, setUtilityMenuOpen] = useState(false);
  const location = useLocation();
  const utilityMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setUtilityMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!utilityMenuRef.current?.contains(event.target as Node)) {
        setUtilityMenuOpen(false);
      }
    }

    if (!utilityMenuOpen) return;
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [utilityMenuOpen]);

  return (
    <>
      <div className="encyclopedia-shell">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <header className={`site-header site-header-sticky${scrolled ? " site-header-scrolled" : ""}`}>
          <Link to="/" className="brand-lockup">
            <span className="brand-mark">PN</span>
            <div>
              <strong>PokeNav</strong>
              <span className="brand-tagline">Pokemon encyclopedia and game guide</span>
            </div>
          </Link>
          <nav className="primary-nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-pill ${isActive ? "active" : ""}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <div className="utility-menu" ref={utilityMenuRef}>
              <button
                type="button"
                className={`utility-menu-trigger${utilityMenuOpen ? " active" : ""}`}
                aria-haspopup="menu"
                aria-expanded={utilityMenuOpen}
                onClick={() => setUtilityMenuOpen((open) => !open)}
              >
                Explore
                <ChevronDown size={16} />
              </button>
              {utilityMenuOpen ? (
                <div className="utility-menu-panel" role="menu" aria-label="Explore encyclopedia sections">
                  {utilityItems.map((item) => (
                    <Link key={item.to} to={item.to} className="utility-menu-link" role="menuitem">
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <Link to="/search" className="quick-search-link" aria-label="Search the encyclopedia">
              <Search size={16} />
              Search
            </Link>
          </div>
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
        <GameContextBar />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} navItems={navItems} utilityItems={utilityItems} />
        <div id="main-content" />
        {children}
      </div>
      <SiteFooter />
      <ScrollToTop />
    </>
  );
}
