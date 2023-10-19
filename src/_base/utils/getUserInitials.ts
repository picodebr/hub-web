export const getUserInitials = (str: string): string =>
  str
    .split(' ')
    .slice(0, 2)
    .reduce((acc, value) => acc.concat(value.split('')[0] || '').toLocaleUpperCase(), '');
