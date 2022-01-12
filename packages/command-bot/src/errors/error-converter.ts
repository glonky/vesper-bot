export interface ErrorConverterConvertErrorProps<E extends Error = Error> {
  error: E;
  message?: string;
}

export interface ErrorConverter<E extends Error> {
  convertError(props: ErrorConverterConvertErrorProps<E>): Error;
}
