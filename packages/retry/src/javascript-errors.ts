const retriableJavascriptErrors: string[] = [];
const nonRetriableJavascriptErrors = [
  RangeError,
  ReferenceError,
  TypeError,
  EvalError,
  SyntaxError,
  URIError,
  'MODULE_NOT_FOUND',
];

export { retriableJavascriptErrors, nonRetriableJavascriptErrors };
