import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type BreadcrumbEntry = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbEntry[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="breadcrumb-item">
          {item.href ? <Link to={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          {index < items.length - 1 ? <ChevronRight size={14} /> : null}
        </span>
      ))}
    </nav>
  );
}
