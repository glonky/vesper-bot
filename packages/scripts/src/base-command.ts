import path from 'path';
import { Command } from '@oclif/command';
import inquirer from 'inquirer';
import Container, { ContainerInstance } from 'typedi';
import { v4 as uuid } from 'uuid';
import { Logger } from '@vesper-discord/logger';
import { BaseConfig } from '@vesper-discord/config';
import { Config } from './config';

export abstract class BaseCommand extends Command {
  protected localConfig!: Config;

  protected logger!: Logger;

  async run() {
    Container.get(BaseConfig).loadDotEnvFiles(path.join(__dirname, '../../..'));

    const container = Container.of(uuid());
    this.logger = container.get(Logger);
    this.localConfig = container.get(Config);

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
      await this.runHandler(container);
    } catch (err) {
      this.logger.error('An error occurred running the script', {
        error: err as Error,
      });

      this.exit(1);
    }
  }

  protected abstract runHandler(container: ContainerInstance): Promise<void>;
}
