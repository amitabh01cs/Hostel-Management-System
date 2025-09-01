/**
 * Format date as DD-MM-YYYY
 */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Generate serial number in format XXXXDDMMYYYY
 * XXXX is a random 4-digit number, padded with zeros
 * DDMMYYYY is the current date
 */
export function generateSerialNumber(): string {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  // Random 4-digit number between 0001 and 9999
  const randomNum = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  
  return `${randomNum}${day}${month}${year}`;
}

/**
 * Validates time format (HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
}

/**
 * Validates date format (DD-MM-YYYY)
 */
export function isValidDateFormat(date: string): boolean {
  const regex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
  return regex.test(date);
}
