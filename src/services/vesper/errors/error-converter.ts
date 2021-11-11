import { ErrorConverter, ErrorConverterConvertErrorProps } from '../../../errors';
import { ExtendedVesperError, VesperError } from './error';
import { VesperInvalidRequestError } from './invalid-request-error';

export class VesperErrorConverter implements ErrorConverter<VesperError> {
  convertError(props: ErrorConverterConvertErrorProps<VesperError>) {
    let resultError;

    const code = props.error?.raw?.code ?? props.error?.code ?? props.error?.raw?.type;
    const message = props.message ?? props.error.message ?? 'Vesper Error';

    switch (code) {
      case 'invalid_request_error':
        resultError = new VesperInvalidRequestError(message, props);
        break;
      default:
        resultError = new ExtendedVesperError(message, props);
    }

    return resultError;
  }
}
