import { ErrorConverter, ErrorConverterConvertErrorProps } from '@vesper-discord/errors';
import { EthersError, ExtendedEthersError } from './error';
import { RetriableEthersError } from './retriable-ethers-error';

export class EthersErrorConverter implements ErrorConverter<EthersError> {
  convertError(props: ErrorConverterConvertErrorProps<EthersError>) {
    let resultError;

    const { error } = props;
    const code = error.code;
    const message = props.error.message ?? 'Ethers Error';

    if (message.includes('request failed or timed out')) {
      return new RetriableEthersError(message, props);
    }

    switch (code) {
      case 'EADDRNOTAVAIL':
      case 'TIMEOUT': {
        resultError = new RetriableEthersError(message, props);
        break;
      }
      default:
        resultError = new ExtendedEthersError(message, props);
    }

    return resultError;
  }
}
