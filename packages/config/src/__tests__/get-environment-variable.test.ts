import { getEnvironmentVariable } from '../get-environment-variable';

describe('getEnvironmentVariable', () => {
  const envVarName = 'FOO';

  beforeEach(() => {
    delete process.env[envVarName];
  });

  it('loads env var correctly', async () => {
    const expected = 'hi';
    process.env[envVarName] = expected;

    expect(getEnvironmentVariable(envVarName)).toBe(expected);
  });

  it('fallbacks to default value if process.env.FOO is undefined', async () => {
    const defaultValue = 'hi';

    const result = getEnvironmentVariable(envVarName, defaultValue);
    expect(result).toBe(defaultValue);
  });

  it('converts to number if default value is a number', async () => {
    const defaultValue = 3;

    const result = getEnvironmentVariable(envVarName, defaultValue);
    expect(typeof result).toBe('number');
  });

  it('converts to boolean if default value is a true boolean', async () => {
    const defaultValue = true;

    const result = getEnvironmentVariable(envVarName, defaultValue);
    expect(typeof result).toBe('boolean');
  });

  it('converts to boolean if default value is a string true', async () => {
    const defaultValue = true;
    process.env[envVarName] = 'true';

    const result = getEnvironmentVariable(envVarName, defaultValue);
    expect(typeof result).toBe('boolean');
  });

  it('converts to boolean if default value is a string TRUE', async () => {
    const defaultValue = true;
    process.env[envVarName] = 'TRUE';

    const result = getEnvironmentVariable(envVarName, defaultValue);
    expect(typeof result).toBe('boolean');
  });

  it('converts to boolean if default value is a false boolean', async () => {
    const defaultValue = false;

    const result = getEnvironmentVariable(envVarName, defaultValue);
    expect(typeof result).toBe('boolean');
  });

  it('converts to boolean if default value is a string false', async () => {
    const defaultValue = false;
    process.env[envVarName] = 'false';

    const result = getEnvironmentVariable(envVarName, defaultValue);
    expect(typeof result).toBe('boolean');
  });

  it('converts to boolean if default value is a string FALSE', async () => {
    const defaultValue = false;
    process.env[envVarName] = 'FALSE';

    const result = getEnvironmentVariable(envVarName, defaultValue);
    expect(typeof result).toBe('boolean');
  });
});
