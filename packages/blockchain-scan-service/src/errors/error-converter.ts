import { assertion, ErrorConverter, ErrorConverterConvertErrorProps } from '@vesper-discord/errors';
import { BlockchainScanServiceType } from '../interfaces';
import { ExtendedBlockchainScanError, BlockchainScanError, ExtendedBlockchainScanErrorProps } from './error';
import { BlockchainScanRateLimitError } from './rate-limit-error';
import { BlockchainScanServiceUnavailableError } from './service-unavailable';

export class BlockchainScanErrorConverter implements ErrorConverter<BlockchainScanError> {
  convertError(
    props: ErrorConverterConvertErrorProps<BlockchainScanError, { scanService: BlockchainScanServiceType }>,
  ) {
    let resultError;

    const { error } = props;
    assertion('ScanService must be defined when converting an error', props?.extraProps?.scanService);
    const scanService = props.extraProps.scanService;
    const existingMessage = error.message || undefined;
    const message = existingMessage ?? error.code ?? `${scanService} Error`;

    const errorProps = { ...props, scanService } as ExtendedBlockchainScanErrorProps;

    if (
      error.code === 'SERVER_ERROR' &&
      (error as any).body.includes('The service is unavailable.') &&
      Number(error.status) === 503
    ) {
      return new BlockchainScanServiceUnavailableError(errorProps);
    }

    switch (message) {
      case 'Max rate limit reached':
        resultError = new BlockchainScanRateLimitError(errorProps);
        break;
      default:
        resultError = new ExtendedBlockchainScanError(message, errorProps);
    }

    return resultError;
  }
}
