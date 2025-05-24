function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const clone = { ...obj };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
}

// Exporting omit function
export default omit