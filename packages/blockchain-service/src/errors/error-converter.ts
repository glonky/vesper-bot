import { ErrorConverter, ErrorConverterConvertErrorProps } from '@vesper-discord/errors';
import { ExtendedBlockchainError, BlockchainError } from './error';

export class BlockchainErrorConverter implements ErrorConverter<BlockchainError> {
  convertError(props: ErrorConverterConvertErrorProps<BlockchainError>) {
    let resultError;

    const code = props.error?.raw?.code ?? props.error?.code ?? props.error?.raw?.type;
    const message = props.error.message ?? 'Blockchain Error';

    switch (code) {
      default:
        resultError = new ExtendedBlockchainError(message, props);
    }

    return resultError;
  }
}
