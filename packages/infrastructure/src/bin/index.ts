#!/usr/bin/env node
import 'reflect-metadata';
// import 'source-map-support/register';
import { BaseConfig } from '@vesper-discord/config';
import { Container } from 'typedi';
import { VesperDiscordApp } from '../app';

Container.get(BaseConfig).loadDotEnvFiles();

new VesperDiscordApp();
