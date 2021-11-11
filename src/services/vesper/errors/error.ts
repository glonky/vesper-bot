import { ExtendedError, ExtendedErrorProps } from '../../../errors';

export type VesperError = Error & {
  code: string;
  data: {
    error: string;
  };
  raw?: {
    type?: string;
    code?: string;
  };
};

export class ExtendedVesperError extends ExtendedError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedVesperError.prototype);
  }
}
