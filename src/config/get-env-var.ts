export function getEnvVar<T extends string | number | string[] | boolean>(envVar?: string, defaultValue?: T): T {
  const result = (envVar as unknown as T) || defaultValue || ('' as T);

  if (typeof defaultValue === 'string') {
    return result;
  }

  if (typeof defaultValue === 'number') {
    return Number(result) as T;
  }

  if (typeof defaultValue === 'boolean' && (result === 'true' || result === 'TRUE' || result === true)) {
    return true as T;
  }

  if (
    typeof defaultValue === 'boolean' &&
    (result === 'false' || result === 'FALSE' || result === false || result === '')
  ) {
    return false as T;
  }

  if (Array.isArray(defaultValue)) {
    return String(result).split(',') as T;
  }

  return result;
}
