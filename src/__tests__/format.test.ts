import { describe, expect, it } from "vitest";
import { capitalize, formatVersionGroupLabel, getFormTag, padDex } from "../lib/format";

describe("format helpers", () => {
  it("pads dex ids", () => {
    expect(padDex(25)).toBe("0025");
  });

  it("formats version groups", () => {
    expect(formatVersionGroupLabel("heartgold-soulsilver")).toBe("HeartGold / SoulSilver");
    expect(formatVersionGroupLabel("legends-arceus")).toBe("Legends: Arceus");
    expect(formatVersionGroupLabel("colosseum")).toBe("Colosseum");
    expect(formatVersionGroupLabel("xd")).toBe("XD: Gale of Darkness");
  });

  it("extracts form tags", () => {
    expect(getFormTag("charizard-mega-x")).toBe("Mega");
  });

  it("capitalizes slugs", () => {
    expect(capitalize("mr-mime")).toBe("Mr Mime");
  });
});
