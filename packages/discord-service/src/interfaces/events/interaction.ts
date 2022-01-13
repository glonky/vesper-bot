import { CommandInteraction } from 'discord.js';
import { DiscordClient } from '../../discord-client';
import { BaseEvent } from './base';

export interface InteractionEventExecuteProps {
  interaction: CommandInteraction;
  client: DiscordClient;
}

export type InteractionExecuteFunction = (props: InteractionEventExecuteProps) => Promise<void>;

export interface InteractionEvent extends BaseEvent<InteractionEventExecuteProps> {
  execute: InteractionExecuteFunction;
}
