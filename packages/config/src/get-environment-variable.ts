export function getEnvironmentVariable<T extends string | number | string[] | boolean>(
  envVarName: string,
  defaultValue?: T,
): T {
  const result = process.env[envVarName] || defaultValue;

  if (typeof defaultValue === 'string') {
    return result as T;
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

  return result as T;
}
