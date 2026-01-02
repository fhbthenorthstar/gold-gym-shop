export type VariantOptionValue = {
  name?: string | null;
  value?: string | null;
} | null;

export type ProductVariant = {
  _key?: string | null;
  sku?: string | null;
  price?: number | null;
  compareAtPrice?: number | null;
  stock?: number | null;
  optionValues?: VariantOptionValue[] | null;
  image?: {
    asset?: {
      url?: string | null;
    } | null;
  } | null;
} | null;

export type ProductOption = {
  name?: string | null;
  values?: string[] | null;
} | null;

export type ProductWithVariants = {
  price?: number | null;
  stock?: number | null;
  options?: ProductOption[] | null;
  variants?: ProductVariant[] | null;
};

export type SelectedOptions = Record<string, string>;

const normalizeName = (value?: string | null) => value?.trim() ?? "";

const getOptionValueMap = (variant: ProductVariant): SelectedOptions => {
  const entries =
    variant?.optionValues
      ?.map((opt) => ({
        name: normalizeName(opt?.name),
        value: normalizeName(opt?.value),
      }))
      .filter((opt) => opt.name && opt.value) ?? [];

  return entries.reduce<SelectedOptions>((acc, entry) => {
    acc[entry.name] = entry.value;
    return acc;
  }, {});
};

export const getVariantKey = (variant: ProductVariant): string => {
  const sku = normalizeName(variant?.sku);
  if (sku) return sku;

  const optionValues = getOptionValueMap(variant);
  const optionKeys = Object.keys(optionValues).sort();
  if (optionKeys.length === 0) return "";

  return optionKeys.map((key) => `${key}=${optionValues[key]}`).join("|");
};

export const getDefaultVariant = (
  product: ProductWithVariants
): ProductVariant => {
  const variants = product.variants ?? [];
  if (variants.length === 0) return null;

  return (
    variants.find((variant) => (variant?.stock ?? 0) > 0) ?? variants[0] ?? null
  );
};

const matchesSelections = (
  variant: ProductVariant,
  selections: SelectedOptions
): boolean => {
  const variantOptions = getOptionValueMap(variant);
  return Object.entries(selections).every(
    ([name, value]) => variantOptions[name] === value
  );
};

export const getVariantBySelectedOptions = (
  product: ProductWithVariants,
  selectedOptions: SelectedOptions
): ProductVariant => {
  const variants = product.variants ?? [];
  const optionNames = (product.options ?? [])
    .map((option) => normalizeName(option?.name))
    .filter(Boolean);

  if (variants.length === 0 || optionNames.length === 0) return null;

  const selectedKeys = Object.keys(selectedOptions).filter((key) =>
    optionNames.includes(key)
  );

  if (selectedKeys.length < optionNames.length) {
    return null;
  }

  return variants.find((variant) => matchesSelections(variant, selectedOptions)) ?? null;
};

export const getAvailableOptionValues = (
  product: ProductWithVariants,
  selectedSoFar: SelectedOptions
): Record<string, string[]> => {
  const variants = product.variants ?? [];
  const options = product.options ?? [];

  return options.reduce<Record<string, string[]>>((acc, option) => {
    const optionName = normalizeName(option?.name);
    if (!optionName) return acc;

    const selections = { ...selectedSoFar };
    delete selections[optionName];

    const matchingVariants =
      selections && Object.keys(selections).length > 0
        ? variants.filter((variant) => matchesSelections(variant, selections))
        : variants;

    const valuesFromVariants = matchingVariants
      .flatMap((variant) => variant?.optionValues ?? [])
      .filter((opt) => normalizeName(opt?.name) === optionName)
      .map((opt) => normalizeName(opt?.value))
      .filter(Boolean);

    const uniqueValues = Array.from(new Set(valuesFromVariants));
    const configuredValues = option?.values?.filter(Boolean) ?? [];

    acc[optionName] = configuredValues.length
      ? configuredValues.filter((value) => uniqueValues.includes(value))
      : uniqueValues;

    return acc;
  }, {});
};

export const getDisplayPrice = (
  product: ProductWithVariants,
  variant: ProductVariant
): number => {
  return variant?.price ?? product.price ?? 0;
};

export const getDisplayStock = (
  product: ProductWithVariants,
  variant: ProductVariant
): number => {
  return variant?.stock ?? product.stock ?? 0;
};

export const getVariantLabel = (variant: ProductVariant): string => {
  if (!variant?.optionValues?.length) return "";
  const parts = variant.optionValues
    .map((opt) => {
      const name = normalizeName(opt?.name);
      const value = normalizeName(opt?.value);
      return name && value ? `${name}: ${value}` : "";
    })
    .filter(Boolean);

  return parts.join(" / ");
};

export const getSelectedOptionsFromVariant = (
  variant: ProductVariant
): SelectedOptions => getOptionValueMap(variant);
