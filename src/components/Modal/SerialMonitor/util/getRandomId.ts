export const getRandomId = () => {
  const now = Date.now();
  return now + Math.random() * now;
};
