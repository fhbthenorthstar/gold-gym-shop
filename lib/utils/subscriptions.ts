export const formatPackageLocation = (value?: string | null) => {
  if (!value) return "Unknown location";
  if (value === "bashundhara-sports-city") return "Bashundhara Sports City";
  if (value === "bashundhara-city-shopping-mall") {
    return "Bashundhara City Shopping Mall";
  }
  return value;
};

export const formatPackageTier = (value?: string | null) => {
  if (!value) return "Package";
  if (value === "pool-spa") return "Pool & Spa";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
