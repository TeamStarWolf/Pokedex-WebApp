import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "./Breadcrumbs";

type IndexEntity = {
  id: string;
  name: string;
  slug: string;
  summary: string;
};

type EntityIndexPageProps<T extends IndexEntity> = {
  title: string;
  eyebrow: string;
  subtitle: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  entities: T[];
  searchPlaceholder: string;
  hrefFor: (entity: T) => string;
  metaFor: (entity: T) => string;
};

export function EntityIndexPage<T extends IndexEntity>({
  title,
  eyebrow,
  subtitle,
  breadcrumbs,
  entities,
  searchPlaceholder,
  hrefFor,
  metaFor,
}: EntityIndexPageProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const filtered = useMemo(
    () => entities.filter((entity) => !query.trim() || `${entity.name} ${entity.summary}`.toLowerCase().includes(query.trim().toLowerCase())),
    [entities, query],
  );

  return (
    <main className="encyclopedia-page">
      <Breadcrumbs items={breadcrumbs} />
      <section className="topic-title-deck content-card">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lead">{subtitle}</p>
        </div>
        <div className="title-deck-metrics">
          <div><strong>{entities.length}</strong><span>Total entries</span></div>
          <div><strong>{filtered.length}</strong><span>Visible entries</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="inline-filter-row">
          <label>
            Search
            <input value={query} onChange={(event) => setSearchParams(event.target.value ? { q: event.target.value } : {})} placeholder={searchPlaceholder} />
          </label>
        </div>
        <div className="search-results-grid">
          {filtered.map((entity) => (
            <Link key={entity.id} to={hrefFor(entity)} className="search-result-card">
              <span className="eyebrow">Entry</span>
              <strong>{entity.name}</strong>
              <span>{metaFor(entity)}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
