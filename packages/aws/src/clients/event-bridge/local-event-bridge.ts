import { Service, Inject } from 'typedi';
import { Logger, LoggerDecorator } from '@vesper-discord/logger';
import { Config } from '../../config';

@Service()
export class LocalEventBridge {
  @LoggerDecorator()
  private logger!: Logger;

  @Inject(() => Config)
  private config!: Config;
}
