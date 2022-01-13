import { Interaction } from 'discord.js';
import { DiscordClient } from '../../discord-client';
import { BaseEvent } from './base';

export interface InteractionCreateEventExecuteProps {
  interaction: Interaction;
  client: DiscordClient;
}

export interface InteractionCreateEvent extends BaseEvent<InteractionCreateEventExecuteProps> {
  execute(props: InteractionCreateEventExecuteProps): Promise<void>;
  name: string;
}
