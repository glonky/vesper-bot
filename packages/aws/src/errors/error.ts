import { RethrownExtendedErrorProps, ExtendedError } from '@vesper-discord/errors';

export type AwsError = Error & {
  code: string;
  requestId: string;
  retryable: boolean;
  retryDelay: number;
  time: string;
};

export class ExtendedAwsError extends ExtendedError<AwsError> {
  public code: string;

  public requestId: string;

  public retryable: boolean;

  public retryDelay: number;

  public time: string;

  constructor(message: string, props: RethrownExtendedErrorProps<AwsError>) {
    super(message, props);

    const error = props.error;
    this.code = error.code;
    this.requestId = error.requestId;
    this.retryable = error.retryable;
    this.retryDelay = error.retryDelay;
    this.time = error.time;

    Object.setPrototypeOf(this, ExtendedAwsError.prototype);
    this.name = this.constructor.name;
  }
}
