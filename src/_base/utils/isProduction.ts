export const isProduction = () => {
  const hash =
    typeof window !== 'undefined' ? window.location.hash.slice(1) : '';

  return hash !== 'local' && process.env.NEXT_PUBLIC_NODE_ENV !== 'local';
};
