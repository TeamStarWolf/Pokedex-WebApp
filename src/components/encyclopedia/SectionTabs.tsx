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
  return (
    <div className="section-tabs" role="tablist" aria-label="Page sections">
      {tabs.map((tab) => (
        <a key={tab.id} href={`#${tab.id}`} className="tab-pill">
          {tab.label}
        </a>
      ))}
    </div>
  );
}
