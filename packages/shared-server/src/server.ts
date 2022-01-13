import Container, { Service } from 'typedi';
import { Server as CommandBotServer } from '@vesper-discord/command-bot';

@Service()
export class Server {
  public async start() {
    await Container.get(CommandBotServer).start();
  }
}
