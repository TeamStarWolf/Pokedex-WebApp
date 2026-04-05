import { useCallback, useEffect, useRef, useState } from "react";
import type { DataStatus } from "../../lib/encyclopedia-schema";

type TabDefinition = {
  id: string;
  label: string;
  status?: DataStatus;
};

type SectionTabsProps = {
  tabs: TabDefinition[];
};

export function SectionTabs({ tabs }: SectionTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleClick = useCallback((id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const ids = tabs.map((tab) => tab.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    const visibleSections = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSections.delete(entry.target.id);
          }
        }

        // Pick the first visible section in document order
        for (const id of ids) {
          if (visibleSections.has(id)) {
            setActiveId(id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: [0, 0.25] },
    );

    for (const el of elements) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [tabs]);

  return (
    <div className="section-tabs" role="tablist" aria-label="Page sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeId === tab.id}
          className={`tab-pill ${activeId === tab.id ? "tab-pill-active" : ""}`}
          onClick={() => handleClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
