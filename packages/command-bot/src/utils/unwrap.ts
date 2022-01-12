import dedent from 'dedent-js';

/**
 * Take the tagged string and remove indentation and word-wrapping.
 *
 * @package util
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrap(strings: TemplateStringsArray, ...expressions: any[]): string {
  return dedent(strings, ...expressions);
}
