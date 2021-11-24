/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/ban-types */
import { RateLimiter, RateLimiterProps } from '../rate-limit';

export const RateLimit =
  (props?: RateLimiterProps) => (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const isMethod = descriptor.value instanceof Function;
    if (!isMethod) throw new Error('RateLimit decorator must be used on a function');

    const originalMethod = descriptor.value as Function;
    descriptor.value = function rateLimitDecorator(...functionArgs: any[]) {
      const rateLimit = new RateLimiter(props);
      return rateLimit.limit(() => originalMethod.apply(this, functionArgs));
    };

    return descriptor;
  };
