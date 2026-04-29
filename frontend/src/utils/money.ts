export function centsToMoney(cents: number, currency = 'MXN') {
  const value = cents / 100;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(value);
}