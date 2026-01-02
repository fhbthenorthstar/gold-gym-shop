export const parseMultiValueParam = (value: string | null): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

export const buildMultiValueParam = (values: string[]): string | null => {
  const cleaned = values.map((value) => value.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(",") : null;
};

export const parseOptionFiltersParam = (
  value: string | null
): Record<string, string[]> => {
  if (!value) return {};

  return value.split("|").reduce<Record<string, string[]>>((acc, segment) => {
    const [rawName, rawValues] = segment.split(":");
    const name = rawName?.trim();
    if (!name) return acc;

    const values = rawValues
      ? rawValues
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean)
      : [];

    acc[name] = values;
    return acc;
  }, {});
};

export const buildOptionFiltersParam = (
  filters: Record<string, string[]>
): string | null => {
  const segments = Object.entries(filters)
    .map(([name, values]) => ({
      name: name.trim(),
      values: values.map((value) => value.trim()).filter(Boolean),
    }))
    .filter((entry) => entry.name && entry.values.length > 0)
    .map((entry) => `${entry.name}:${entry.values.join(",")}`);

  return segments.length > 0 ? segments.join("|") : null;
};
