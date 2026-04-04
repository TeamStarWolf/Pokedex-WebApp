type Props = {
  title?: string;
  body?: string;
  variant?: "page" | "inline";
};

export function LoadingSpinner({ title, body, variant = "page" }: Props) {
  if (variant === "inline") {
    return (
      <div className="loading-spinner-inline">
        <div className="spinner-ring" />
        {title ? <span className="muted">{title}</span> : null}
      </div>
    );
  }

  return (
    <main className="encyclopedia-page">
      <section className="content-card loading-spinner-page">
        <div className="spinner-ring" />
        {title ? <h1>{title}</h1> : null}
        {body ? <p className="muted">{body}</p> : null}
      </section>
    </main>
  );
}
