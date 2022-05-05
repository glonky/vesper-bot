import { Service, Inject } from 'typedi';
import { Logger, LoggerDecorator } from '@vesper-discord/logger';
import { Config } from '../../config';

@Service()
export class LocalDynamoDBClient {
  @LoggerDecorator()
  private readonly logger!: Logger;

  @Inject(() => Config)
  private readonly config!: Config;
}
