export function sanitizeFileName(input: string): string {
  if (!input || typeof input !== 'string') return 'Untitled_Project';

  // 1. Convert Vietnamese đ/Đ
  let str = input.replace(/đ/g, 'd').replace(/Đ/g, 'D');

  // 2. Normalize NFD and remove diacritics
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 3. Replace spaces with underscores
  str = str.replace(/\s+/g, '_');

  // 4. Remove all characters except a-z, A-Z, 0-9, _, -
  str = str.replace(/[^a-zA-Z0-9_-]/g, '');

  // 5. Replace multiple underscores with a single underscore
  str = str.replace(/_+/g, '_');

  // 6. Trim leading/trailing underscores or hyphens
  str = str.replace(/^[-_]+|[-_]+$/g, '');

  // 7. Fallback if empty
  if (!str) str = 'Untitled_Project';

  // 8. Max length 100 characters
  if (str.length > 100) str = str.substring(0, 100);

  return str;
}
