export interface ErrorConverterConvertErrorProps<E extends Error = Error, P = any> {
  error: E;
  extraProps?: P;
}

export interface ErrorConverter<E extends Error, P = any> {
  convertError(props: ErrorConverterConvertErrorProps<E, P>): Error;
}
