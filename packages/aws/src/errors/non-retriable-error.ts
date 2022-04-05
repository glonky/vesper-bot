import { RethrownExtendedErrorProps, NonRetriableError } from '@vesper-discord/errors';

export class AwsNonRetriableError extends NonRetriableError {
  public code: string;

  public requestId: string;

  public retryable: boolean;

  public retryDelay: number;

  public time: Date;

  constructor(message: string, props: RethrownExtendedErrorProps) {
    super(message, props);

    const error = props.error as any;
    this.code = error.code;
    this.requestId = error.requestId;
    this.retryable = error.retryable;
    this.retryDelay = error.retryDelay;
    this.time = error.time;

    Object.setPrototypeOf(this, AwsNonRetriableError.prototype);
    this.name = this.constructor.name;
  }
}
