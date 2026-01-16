// =======================================
// Pricing Engine (Total Price Based)
// =======================================

// userPrice = TOTAL price for entire quantity

const BASE_PRICE_PER_KG = {
  bread: 4,
  rice: 6,
  chicken: 12,
  vegetables: 5,
  fruits: 5,
  cooked_meal: 10
};

export function evaluatePrice({
  itemType,
  expiryDate,
  quantityValue,
  quantityUnit,
  userPrice
}) {
  // -----------------------------
  // Date logic
  // -----------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2. Force expiry string (YYYY-MM-DD) to parse as LOCAL midnight
  // Appending "T00:00:00" ensures browser treats it as local time, not UTC
  const expiry = new Date(expiryDate + "T00:00:00");
  const daysToExpiry = Math.ceil(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );

  // -----------------------------
  // Quantity normalization (kg)
  // -----------------------------
  const quantityKg = normalizeQuantity(quantityValue, quantityUnit);

  if (quantityKg <= 0 || userPrice <0) {
    return null;
  }

  // -----------------------------
  // Base price per kg
  // -----------------------------
  const basePricePerKg =
    BASE_PRICE_PER_KG[itemType] || 6;

  // -----------------------------
  // Expiry factor
  // -----------------------------
  let expiryFactor = 1;
  if (daysToExpiry <= 1) expiryFactor = 0.4;
  else if (daysToExpiry <= 3) expiryFactor = 0.6;
  else if (daysToExpiry <= 5) expiryFactor = 0.8;

  // -----------------------------
  // Bulk factor (large quantities cheaper)
  // -----------------------------
  let bulkFactor = 1;
  if (quantityKg >= 100) bulkFactor = 0.5;
  else if (quantityKg >= 10) bulkFactor = 0.7;
  else if (quantityKg >= 2) bulkFactor = 0.85;

  // -----------------------------
  // Expected TOTAL price
  // -----------------------------
  const expectedTotalPrice =
    basePricePerKg *
    quantityKg *
    expiryFactor *
    bulkFactor;

    if (userPrice === 0) {
    return {
      verdict: "Fair", // Keep it "Fair" so your green styling works automatically
      message: "It's Free! This is the best possible value.",
      suggestedPrice: expectedTotalPrice.toFixed(2)
    };
  }

  // -----------------------------
  // Compare prices
  // -----------------------------
  const ratio = userPrice / expectedTotalPrice;

  let verdict = "Fair";
  let message = "Price is reasonable for a surplus item.";

  if (ratio > 1.4) {
    verdict = "Unfair";
    message = "Price is too high for the quantity and expiry.";
  } else if (ratio > 1.1) {
    verdict = "Slightly High";
    message = "Price is slightly higher than expected.";
  } else if (ratio < 0.6) {
    verdict = "Fair";
    message = "Very good value — likely to sell quickly.";
  }

  return {
    verdict,
    message,
    suggestedPrice: expectedTotalPrice.toFixed(2)
  };
}

// ----------------------------------
// Quantity normalization helper
// ----------------------------------
function normalizeQuantity(value, unit) {
  if (!value) return 0;

  switch (unit) {
    case "g":
      return value / 1000;
    case "kg":
      return value;
    case "portion":
      return value * 0.4;
    case "item":
    default:
      return value * 0.5;
  }
}