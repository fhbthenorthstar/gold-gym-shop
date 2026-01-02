export const buildCartItemId = (
  productId: string,
  variantKey?: string | null
): string => {
  const key = variantKey?.trim();
  return key ? `${productId}::${key}` : productId;
};
