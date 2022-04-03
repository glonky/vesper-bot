import { ExtendedErrorProps, NonRetriableError } from '@vesper-discord/errors';

export class NotProxyAddressError extends NonRetriableError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, { ...props });

    Object.setPrototypeOf(this, NotProxyAddressError.prototype);
    this.name = this.constructor.name;
  }
}
