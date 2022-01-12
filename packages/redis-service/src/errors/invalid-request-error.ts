import { ExtendedErrorProps } from '@vesper-discord/errors';
import { ExtendedRedisError } from './error';

export class RedisInvalidRequestError extends ExtendedRedisError {
  constructor(message: string, props: ExtendedErrorProps) {
    super(message, props);
    Object.setPrototypeOf(this, ExtendedRedisError.prototype);
  }
}
