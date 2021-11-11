import { ExtendedErrorProps } from '../../../errors';
import { ExtendedVesperError } from './error';

export class VesperInvalidRequestError extends ExtendedVesperError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedVesperError.prototype);
  }
}
