import { RethrownExtendedErrorProps, ExtendedError } from '../extended-error';

export type DiscordError = Error & {
  code: string;
  requestId: string;
  retryable: boolean;
  retryDelay: number;
  time: string;
};

export class ExtendedDiscordError extends ExtendedError<DiscordError> {
  public code: string;

  public requestId: string;

  public retryable: boolean;

  public retryDelay: number;

  public time: string;

  constructor(message: string, props: RethrownExtendedErrorProps<DiscordError>) {
    super(message, props);

    const error = props.error;
    this.code = error.code;
    this.requestId = error.requestId;
    this.retryable = error.retryable;
    this.retryDelay = error.retryDelay;
    this.time = error.time;

    // This is a limitation of typescript and jest
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ExtendedDiscordError.prototype);
  }
}
