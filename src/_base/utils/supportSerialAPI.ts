export const supportSerialAPI = () =>
  typeof navigator !== 'undefined' && !!navigator.serial;
