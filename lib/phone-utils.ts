/**
 * Formats a Brazilian phone number with mask
 * Input: 11995410041 -> Output: (11) 99541-0041
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, '');

  // Limit to 11 digits (2 area code + 9 phone number)
  const limitedNumbers = numbers.slice(0, 11);

  // Apply formatting
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 7) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  }
}

/**
 * Removes formatting from phone number
 * Input: (11) 99541-0041 -> Output: 5511995410041
 */
export function unformatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, '');
  // Always add country code 55 (Brazil) if not present
  if (numbers.length === 11 && !numbers.startsWith('55')) {
    return '55' + numbers;
  }
  return numbers;
}

/**
 * Validates Brazilian phone number format
 * Must have 11 digits (DDD + 9 digits)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');

  // With country code: 5511999999999 (13 digits)
  if (numbers.length === 13 && numbers.startsWith('55')) {
    return true;
  }

  // Without country code: 11999999999 (11 digits)
  if (numbers.length === 11) {
    return true;
  }

  return false;
}
