import { useEffect, useState } from "react";

export function useLocalStorageState<T>(readValue: () => T, writeValue: (value: T) => void) {
  const [value, setValue] = useState<T>(readValue);

  useEffect(() => {
    writeValue(value);
  }, [value, writeValue]);

  return [value, setValue] as const;
}
