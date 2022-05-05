import { ErrorConverter, ErrorConverterConvertErrorProps } from '@vesper-discord/errors';
import { ExtendedEtherscanError, EtherscanError } from './error';
import { EtherscanRateLimitError } from './rate-limit-error';
import { EtherscanServiceUnavailableError } from './service-unavailable';

export class EtherscanErrorConverter implements ErrorConverter<EtherscanError> {
  convertError(props: ErrorConverterConvertErrorProps<EtherscanError>) {
    let resultError;

    const { error } = props;
    const message = error.message ?? 'Etherscan Error';
    if (
      error.code === 'SERVER_ERROR' &&
      (error as any).body.includes('The service is unavailable.') &&
      Number(error.status) === 503
    ) {
      return new EtherscanServiceUnavailableError(props);
    }

    switch (message) {
      case 'Max rate limit reached':
        resultError = new EtherscanRateLimitError(props);
        break;
      default:
        resultError = new ExtendedEtherscanError(props);
    }

    return resultError;
  }
}
