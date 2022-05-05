import { Command } from '@oclif/command';
import inquirer from 'inquirer';
import Container, { ContainerInstance } from 'typedi';
import { ulid } from 'ulid';
import { Logger } from '@vesper-discord/logger';
import { BaseConfig } from '@vesper-discord/config';
import { RedisService } from '@vesper-discord/redis-service';
import { setupContainer as setupAwsContainer, Config as AwsConfig } from '@vesper-discord/aws';
import { Config } from './config';

export abstract class BaseCommand extends Command {
  protected localConfig!: Config;

  protected logger!: Logger;

  protected container!: ContainerInstance;

  async run() {
    Container.get(BaseConfig).loadDotEnvFiles();

    this.container = Container.of(ulid());
    const redisClient = this.container.get(RedisService).init();
    this.logger = this.container.get(Logger);
    this.localConfig = this.container.get(Config);
    const awsConfig = this.container.get(AwsConfig);

    setupAwsContainer({
      container: this.container,
      dynamoDBClient: {
        endpoint: awsConfig.services.dynamoDb.endpoint,
      },
    });

    if (this.localConfig.isProduction && !this.localConfig.isCI) {
      const { confirmProd } = await inquirer.prompt({
        message: `You are in PRODUCTION do you want to continue? Type 'prod' to continue`,
        name: 'confirmProd',
        type: 'input',
      });

      if (confirmProd !== 'prod') {
        this.logger.warn('Aborting');
        return;
      }
    }

    try {
      await this.runHandler();
    } catch (err) {
      this.logger.error('An error occurred running the script', {
        error: err as Error,
      });

      this.exit(1);
    } finally {
      redisClient?.quit();
    }
  }

  protected abstract runHandler(): Promise<void>;
}
