import { DiscordClient } from '@vesper-discord/discord-service';
import { flags } from '@oclif/command';
import { BaseCommand } from '../base-command';

export default class SetDiscordBotNicknameCommand extends BaseCommand {
  static flags = {
    nickname: flags.string({
      char: 'n',
      description: 'The nickname to set the bot to.',
      required: true,
    }),
    token: flags.string({
      char: 't',
      description: 'The token to use for the bot.',
      required: true,
    }),
  };

  static description = 'Sets the nickname of the bot.';

  static examples = ['$ vesper set-discord-bot-nickname -n <nickName> -t <token>'];

  async runHandler() {
    const { flags: cliFlags } = this.parse(SetDiscordBotNicknameCommand);

    const { nickname, token } = cliFlags;
    this.logger.info('Setting nickname', { nickname });

    const client = new DiscordClient({
      intents: [],
    });
    await client.start({ token });

    try {
      await client.botMember?.setNickname(nickname);
    } catch (err) {
      this.logger.error('Error when trying to set nickname', { error: err as Error });
    } finally {
      client.destroy();
    }
  }
}
