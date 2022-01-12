/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/ban-types */
import { retry, RetryProps } from '../retry';

export const Retriable =
  (props?: RetryProps) => (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const isMethod = descriptor.value instanceof Function;
    if (!isMethod) throw new Error('Retry decorator must be used on a function');

    const originalMethod = descriptor.value as Function;
    descriptor.value = function retryDecorator(...functionArgs: any[]) {
      return retry(() => originalMethod.apply(this, functionArgs), props);
    };

    return descriptor;
  };
