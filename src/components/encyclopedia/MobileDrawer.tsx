// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { useCallback, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type NavItem = { label: string; to: string };

type Props = {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  utilityItems: NavItem[];
};

export function MobileDrawer({ open, onClose, navItems, utilityItems }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.classList.add("body-scroll-lock");
    document.body.style.top = `-${scrollY}px`;
    return () => {
      document.body.classList.remove("body-scroll-lock");
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Focus trap + Escape
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKeyDown);
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="mobile-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            className="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="mobile-drawer-header">
              <strong>Menu</strong>
              <button type="button" onClick={onClose} aria-label="Close menu" className="dialog-close">
                <X size={18} />
              </button>
            </div>
            <nav className="mobile-drawer-nav" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-drawer-link ${isActive ? "active" : ""}`}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <hr className="mobile-drawer-divider" />
            <nav className="mobile-drawer-nav" aria-label="Browse categories">
              {utilityItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-drawer-link ${isActive ? "active" : ""}`}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
