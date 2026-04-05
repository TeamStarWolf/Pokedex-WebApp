import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { paginate } from "../../lib/encyclopedia";
import { Breadcrumbs } from "./Breadcrumbs";
import { Pagination } from "./Pagination";

const PAGE_SIZE = 36;

type IndexEntity = {
  id: string;
  name: string;
  slug: string;
  summary: string;
};

type FilterDefinition = {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
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
  filters?: FilterDefinition[];
  filterFn?: (entity: T, activeFilters: Record<string, string>) => boolean;
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
  filters = [],
  filterFn,
}: EntityIndexPageProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const activeFilters = useMemo(() => {
    const result: Record<string, string> = {};
    for (const filter of filters) {
      result[filter.key] = searchParams.get(filter.key) ?? filter.defaultValue ?? "all";
    }
    return result;
  }, [filters, searchParams]);

  const filtered = useMemo(() => {
    return entities.filter((entity) => {
      if (query.trim() && !`${entity.name} ${entity.summary}`.toLowerCase().includes(query.trim().toLowerCase())) {
        return false;
      }
      if (filterFn && !filterFn(entity, activeFilters)) {
        return false;
      }
      return true;
    });
  }, [entities, query, activeFilters, filterFn]);

  const paginationResult = paginate(filtered, page, PAGE_SIZE);

  function updateParam(next: Record<string, string>) {
    const merged = new URLSearchParams(searchParams);
    if (!("page" in next)) merged.delete("page");
    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "page" && value === "1")) merged.delete(key);
      else merged.set(key, value);
    });
    setSearchParams(merged);
  }

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
          <div><strong>{filtered.length}</strong><span>Matching</span></div>
        </div>
      </section>
      <section className="content-card">
        <div className="browse-toolbar">
          <div className="inline-filter-row trainer-filter-grid">
            <label>
              Search
              <input value={query} onChange={(event) => updateParam({ q: event.target.value })} placeholder={searchPlaceholder} />
            </label>
            {filters.map((filter) => (
              <label key={filter.key}>
                {filter.label}
                <select value={activeFilters[filter.key] ?? "all"} onChange={(event) => updateParam({ [filter.key]: event.target.value })}>
                  <option value="all">All {filter.label.toLowerCase()}s</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
        {paginationResult.items.length ? (
          <>
            <div className="search-results-grid">
              {paginationResult.items.map((entity) => (
                <Link key={entity.id} to={hrefFor(entity)} className="search-result-card">
                  <span className="eyebrow">Entry</span>
                  <strong>{entity.name}</strong>
                  <span>{metaFor(entity)}</span>
                </Link>
              ))}
            </div>
            <Pagination
              page={paginationResult.page}
              totalPages={paginationResult.totalPages}
              onChange={(p) => updateParam({ page: String(p) })}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
            />
          </>
        ) : (
          <div className="empty-results-panel">
            <strong>No {title.toLowerCase()} match these filters.</strong>
            <p className="muted">Try a different search term or widen the filters.</p>
          </div>
        )}
      </section>
    </main>
  );
}
