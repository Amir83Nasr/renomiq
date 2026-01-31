/**
 * Persian Number Utilities
 * Convert English numbers to Persian and vice versa
 */

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert English numbers to Persian
 */
export function toPersianNumber(num: number | string): string {
  const str = String(num);
  return str
    .split('')
    .map((char) => {
      const index = englishDigits.indexOf(char);
      return index !== -1 ? persianDigits[index] : char;
    })
    .join('');
}

/**
 * Convert Persian numbers to English
 */
export function toEnglishNumber(num: string): string {
  return num
    .split('')
    .map((char) => {
      const index = persianDigits.indexOf(char);
      return index !== -1 ? englishDigits[index] : char;
    })
    .join('');
}

/**
 * Format a number with proper locale (Persian or English)
 */
export function formatNumber(num: number | string, locale: 'fa' | 'en' = 'en'): string {
  if (locale === 'fa') {
    return toPersianNumber(num);
  }
  return String(num);
}
