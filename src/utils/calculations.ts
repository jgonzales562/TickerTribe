// Mathematical calculation utilities

/**
 * Calculate quantity based on percentage
 * @param originalQuantity - The original quantity
 * @param percentage - Percentage to apply (e.g., 50 for 50%)
 * @returns Calculated quantity rounded down to nearest integer
 */
export const calculatePercentageQuantity = (
  originalQuantity: number,
  percentage: number
): number => {
  return Math.floor((originalQuantity * percentage) / 100);
};

/**
 * Calculate total cost
 * @param quantity - Number of shares
 * @param price - Price per share
 * @returns Total cost
 */
export const calculateTotalCost = (quantity: number, price: number): number => {
  return quantity * price;
};
