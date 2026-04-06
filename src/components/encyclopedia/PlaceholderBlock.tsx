// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
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
