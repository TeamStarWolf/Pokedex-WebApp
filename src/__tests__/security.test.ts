// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { describe, expect, it } from "vitest";
import { sanitizeExternalUrl } from "../lib/security";

describe("external URL sanitization", () => {
  it("allows https URLs", () => {
    expect(sanitizeExternalUrl("https://bulbapedia.bulbagarden.net/wiki/Main_Page"))
      .toBe("https://bulbapedia.bulbagarden.net/wiki/Main_Page");
  });

  it("rejects dangerous protocols", () => {
    expect(sanitizeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("rejects insecure remote http URLs", () => {
    expect(sanitizeExternalUrl("http://example.com")).toBeNull();
  });
});
