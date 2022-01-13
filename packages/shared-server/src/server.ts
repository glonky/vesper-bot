import path from 'path';
import Container, { Service } from 'typedi';
import { Server as CommandBotServer } from '@vesper-discord/command-bot';
import { Server as SidebarGasBotServer } from '@vesper-discord/sidebar-gas-bot';
import { Server as SidebarExchangeRateBotServer } from '@vesper-discord/sidebar-exchange-rate-bot';
import { RedisService } from '@vesper-discord/redis-service';
import { BaseConfig } from '@vesper-discord/config';

@Service()
export class Server {
  public async start() {
    Container.get(RedisService).init();
    Container.get(BaseConfig).loadDotEnvFiles(path.join(__dirname, '../../..'));
    await Container.get(CommandBotServer).start();
    await Container.get(SidebarGasBotServer).start();
    await Container.get(SidebarExchangeRateBotServer).start();
  }
}
