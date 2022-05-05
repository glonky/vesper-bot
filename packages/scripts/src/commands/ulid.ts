import { flags } from '@oclif/command';
import { ulid as createUlid, decodeTime } from 'ulid';
import { BaseCommand } from '../base-command';

export default class UlidCommand extends BaseCommand {
  static flags = {
    create: flags.boolean({
      char: 'c',
      description: 'Create ULID',
    }),
    ulid: flags.string({
      char: 'u',
      description: 'The ULID to decode',
    }),
  };

  async runHandler() {
    const { flags: cliFlags } = this.parse(UlidCommand);

    const { create, ulid } = cliFlags;

    if (create) {
      this.logger.info('ulid', { ulid: createUlid() });
      return;
    } else if (ulid) {
      this.logger.info('Time', { time: decodeTime(ulid) });
      return;
    }
  }
}
