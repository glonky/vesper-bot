import { DiscordClient } from '../../discord-client';
import { BaseEvent } from './base';

export interface ReadyEventExecuteProps {
  client: DiscordClient;
}

export interface ReadyEvent extends BaseEvent<ReadyEventExecuteProps> {
  execute(props: ReadyEventExecuteProps): Promise<void>;
  name: string;
  once?: boolean;
}
