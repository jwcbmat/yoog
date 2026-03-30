export const normalizePhone = (value: string | undefined) => {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');

  const limited = numbers.slice(0, 11);

  if (limited.length <= 2) return limited;
  if (limited.length <= 7)
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;

  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
};
