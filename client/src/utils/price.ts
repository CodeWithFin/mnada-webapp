/**
 * Converts price to KSH and rounds to nearest thousand
 * @param price - Price in USD (or any currency)
 * @returns Formatted price string in KSH rounded to nearest thousand
 */
export function formatPriceKSH(price: number): string {
  // Convert USD to KSH (approximate rate: 1 USD = 135 KSH)
  const USD_TO_KSH = 135
  const priceInKSH = price * USD_TO_KSH
  
  // Round to nearest thousand
  const roundedPrice = Math.round(priceInKSH / 1000) * 1000
  
  // Format with commas
  return `KSh ${roundedPrice.toLocaleString('en-US')}`
}

/**
 * Converts price to KSH and rounds to nearest thousand (returns number)
 * @param price - Price in USD (or any currency)
 * @returns Price in KSH rounded to nearest thousand
 */
export function convertToKSH(price: number): number {
  const USD_TO_KSH = 135
  const priceInKSH = price * USD_TO_KSH
  return Math.round(priceInKSH / 1000) * 1000
}

/**
 * Converts KSH price back to USD for database storage
 * @param priceKSH - Price in KSH (rounded to nearest thousand)
 * @returns Price in USD
 */
export function convertKSHToUSD(priceKSH: number): number {
  const USD_TO_KSH = 135
  return priceKSH / USD_TO_KSH
}

/**
 * Converts USD price to KSH for form display
 * @param priceUSD - Price in USD
 * @returns Price in KSH rounded to nearest thousand
 */
export function convertUSDToKSH(priceUSD: number): number {
  return convertToKSH(priceUSD)
}

