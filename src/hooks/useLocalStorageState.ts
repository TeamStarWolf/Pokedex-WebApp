// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { useEffect, useRef, useState } from "react";

export function useLocalStorageState<T>(readValue: () => T, writeValue: (value: T) => void) {
  const [value, setValue] = useState<T>(readValue);
  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    writeValue(value);
  }, [value, writeValue]);

  return [value, setValue] as const;
}
