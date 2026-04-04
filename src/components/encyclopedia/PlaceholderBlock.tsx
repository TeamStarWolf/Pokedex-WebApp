type PlaceholderBlockProps = {
  title: string;
  body: string;
};

export function PlaceholderBlock({ title, body }: PlaceholderBlockProps) {
  return (
    <div className="placeholder-block">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}
