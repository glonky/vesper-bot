import { ErrorConverter, ErrorConverterConvertErrorProps } from '../../../errors';
import { ExtendedCoinGeckoError, CoinGeckoError } from './error';
import { CoinGeckoInvalidRequestError } from './invalid-request-error';

export class CoinGeckoErrorConverter implements ErrorConverter<CoinGeckoError> {
  convertError(props: ErrorConverterConvertErrorProps<CoinGeckoError>) {
    let resultError;

    const code = props.error?.raw?.code ?? props.error?.code ?? props.error?.raw?.type;
    const message = props.message ?? props.error.message ?? 'CoinGecko Error';

    switch (code) {
      case 'invalid_request_error':
        resultError = new CoinGeckoInvalidRequestError(message, props);
        break;
      default:
        resultError = new ExtendedCoinGeckoError(message, props);
    }

    return resultError;
  }
}
