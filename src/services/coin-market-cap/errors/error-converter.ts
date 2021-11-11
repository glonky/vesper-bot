import { ErrorConverter, ErrorConverterConvertErrorProps } from '../../../errors';
import { ExtendedCoinMarketCapError, CoinMarketCapError } from './error';
import { StripeInvalidRequestError } from './invalid-request-error';

export class CoinMarketCapErrorConverter implements ErrorConverter<CoinMarketCapError> {
  convertError(props: ErrorConverterConvertErrorProps<CoinMarketCapError>) {
    let resultError;

    const code = props.error?.raw?.code ?? props.error?.code ?? props.error?.raw?.type;
    const message = props.message ?? props.error.message ?? 'CoinMarketCap Error';

    switch (code) {
      case 'invalid_request_error':
        resultError = new StripeInvalidRequestError(message, props);
        break;
      default:
        resultError = new ExtendedCoinMarketCapError(message, props);
    }

    return resultError;
  }
}
