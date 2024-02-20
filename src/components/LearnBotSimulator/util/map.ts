export const map = (value: number, fromStart: number, fromEnd: number, toStart: number, toEnd: number) => {
  const fromDiff = Math.max(fromEnd - fromStart);
  const toDiff = Math.max(toEnd - toStart);
  const scale = toDiff / (fromDiff || 1);

  return (value - fromStart) * scale + toStart || 0;
};
