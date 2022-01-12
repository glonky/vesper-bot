import { ErrorConverter, ErrorConverterConvertErrorProps } from '../../../errors';
import { ExtendedStripeError, EtherscanError } from './error';
import { EtherscanInvalidRequestError } from './invalid-request-error';

export class EtherscanErrorConverter implements ErrorConverter<EtherscanError> {
  convertError(props: ErrorConverterConvertErrorProps<EtherscanError>) {
    let resultError;

    const code = props.error?.raw?.code ?? props.error?.code ?? props.error?.raw?.type;
    const message = props.message ?? props.error.message ?? 'Etherscan Error';

    switch (code) {
      case 'invalid_request_error':
        resultError = new EtherscanInvalidRequestError(message, props);
        break;
      default:
        resultError = new ExtendedStripeError(message, props);
    }

    return resultError;
  }
}
