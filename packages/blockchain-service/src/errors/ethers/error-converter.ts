import { ErrorConverter, ErrorConverterConvertErrorProps } from '@vesper-discord/errors';
import { EthersError, ExtendedEthersError } from './error';

export class EthersErrorConverter implements ErrorConverter<EthersError> {
  convertError(props: ErrorConverterConvertErrorProps<EthersError>) {
    let resultError;

    const { error } = props;
    const code = error.code;
    const message = props.error.message ?? 'Ethers Error';

    switch (code) {
      default:
        resultError = new ExtendedEthersError(message, props);
    }

    return resultError;
  }
}
