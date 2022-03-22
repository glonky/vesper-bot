/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable func-names */
/**
 * Determine whether the given `promise` is a Promise.
 *
 */
export function isPromise(promise: any): promise is Promise<any> {
  return (
    typeof promise?.then === 'function' || promise instanceof Object.getPrototypeOf(async function () {}).constructor
  );
}
