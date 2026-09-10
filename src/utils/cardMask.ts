export function formatCardNumber(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiry(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCVV(input: string): string {
  return input.replace(/\D/g, '').slice(0, 4);
}

export function isValidCardNumber(formatted: string): boolean {
  const digits = formatted.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  // Algoritmo de Luhn
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(formatted: string): boolean {
  const match = formatted.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = Number(match[2]) + 2000;
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) return false;

  return true;
}

export function isValidCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

export function isValidCardName(name: string): boolean {
  return name.trim().length >= 3;
}
