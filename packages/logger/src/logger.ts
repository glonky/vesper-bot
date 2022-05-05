/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import util from 'util';
import path from 'node:path';
import PinoPretty from 'pino-pretty';
import { DateTime } from 'luxon';
import pino, { DestinationStream, Level, LoggerOptions, multistream, StreamEntry } from 'pino';
import { Service, Inject, ContainerInstance } from 'typedi';
import { merge } from 'lodash';
import { Config } from './config';

export interface OptionalProps {
  [index: string]: any;
}

export interface ErrorProps {
  error?: Error | string;
}

export interface LoggerProps {
  deep?: boolean;
  blacklist?: string[];
}

@Service()
export class Logger {
  @Inject(() => Config)
  private readonly config!: Config;

  public _logger?: pino.Logger;

  private get logger() {
    if (this._logger) {
      return this._logger;
    }

    const timeFunction = () => `,"time":"${DateTime.now().toISOTime()}"`;

    const streams: (DestinationStream | StreamEntry)[] | DestinationStream | StreamEntry = [];

    const allLevels: Level[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

    if (this.config.isTest) {
      streams.push(
        ...allLevels.map((level) => ({
          level: level as Level,
          stream: {
            write: (msg: any) => {
              (console as any)[level](JSON.parse(msg).msg);
            },
          },
        })),
      );
    }

    if (this.config.prettyPrint && !this.config.isTest) {
      streams.push(
        ...allLevels.map((level) => ({
          level: level as Level,
          stream: PinoPretty({ colorize: this.config.colors, sync: this.config.sync }),
        })),
      );
    }

    if (this.config.logToFile) {
      const allFile = createStreamFilePath(this.config.allLogFile ?? 'all.log');
      const errorFile = createStreamFilePath(this.config.errorLogFile ?? 'error.log');

      streams.push(
        ...allLevels.map((level) => ({
          level: level as Level,
          stream: pino.destination({ dest: allFile.toString(), sync: this.config.sync }),
        })),
        { level: 'error', stream: pino.destination({ dest: errorFile.toString(), sync: this.config.sync }) },
      );
    }

    const pinoProps: LoggerOptions = {
      base: null,
      enabled: this.config.enabled,
      formatters: {
        level(label) {
          return { level: label.toUpperCase() };
        },
      },
      level: this.config.level.toLowerCase() ?? 'info',
      timestamp: this.config.timestamp ?? this.config.isLocal ? timeFunction : false,
    };

    if (this.config.isLocal) {
      this._logger = pino(pinoProps, multistream(streams, { dedupe: true }));
    } else {
      this._logger = pino(pinoProps);
    }

    return this._logger;
  }

  public setName(name: string) {
    return {
      debug: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
        this.debug(message, merge({ logger: name }, optionalProps ?? {}), loggerProps),
      error: (message: string, optionalProps?: OptionalProps & ErrorProps, loggerProps?: LoggerProps) =>
        this.error(message, merge({ logger: name }, optionalProps ?? {}), loggerProps),
      fatal: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
        this.fatal(message, merge({ logger: name }, optionalProps ?? {}), loggerProps),
      info: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
        this.info(message, merge({ logger: name }, optionalProps ?? {}), loggerProps),
      trace: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
        this.trace(message, merge({ logger: name }, optionalProps ?? {}), loggerProps),
      warn: (message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) =>
        this.warn(message, merge({ logger: name }, optionalProps ?? {}), loggerProps),
    } as Logger;
  }

  public error(message: string, optionalProps?: OptionalProps & ErrorProps, loggerProps?: LoggerProps) {
    return this.logger.error(this.createMessage(message, optionalProps, loggerProps));
  }

  public warn(message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) {
    return this.logger.warn(this.createMessage(message, optionalProps, loggerProps));
  }

  public debug(message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) {
    return this.logger.debug(this.createMessage(message, optionalProps, loggerProps));
  }

  public trace(message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) {
    return this.logger.trace(this.createMessage(message, optionalProps, loggerProps));
  }

  public info(message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) {
    return this.logger.info(this.createMessage(message, optionalProps, loggerProps));
  }

  public fatal(message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) {
    return this.logger.fatal(this.createMessage(message, optionalProps, loggerProps));
  }

  private createMessage(message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps): any;

  private createMessage(message: string, optionalProps?: OptionalProps & ErrorProps, loggerProps?: LoggerProps): any {
    const propsToLog = merge({}, optionalProps ?? ({} as OptionalProps & ErrorProps));

    let result: any;

    if (this.config.prettyPrint ?? (this.config.isDevelopment || this.config.isLocal)) {
      result = message;
    } else {
      result = { message };
    }

    Object.entries(propsToLog).forEach(([key, value]) => {
      let depth: null | undefined | number = loggerProps?.deep ?? true ? null : undefined;
      const showHidden = !!(loggerProps?.deep ?? true);

      if (isErrorProps(optionalProps)) {
        depth = this.config.isDevelopment || this.config.isLocal ? 3 : 2;
      }

      const inspectProps: util.InspectOptions = {
        colors: this.config.colors ?? false,
        depth,
        showHidden,
        sorted: this.config.isDevelopment || this.config.isLocal,
      };

      let inspectedValue = value;

      if (value && !(value instanceof ContainerInstance)) {
        let valueToInspect = value;

        if (key === 'error') {
          inspectProps.showHidden = false;

          const { ...error } = value;
          valueToInspect = {
            message: value.message,
            stack: value.stack,
            ...error,
          };
        }

        if (valueToInspect) {
          inspectedValue =
            typeof valueToInspect === 'string' ? valueToInspect : util.inspect(valueToInspect, inspectProps);
        }
      }

      if (inspectedValue !== undefined && inspectedValue !== null) {
        if (this.config.prettyPrint ?? (this.config.isDevelopment || this.config.isLocal)) {
          result = `${result} [${key}: ${inspectedValue}]`;
        } else {
          (result as any)[key] = inspectedValue;
        }
      }
    });

    return result;
  }
}

function createStreamFilePath(fileName: string) {
  const fileDate = DateTime.now().startOf('hour').toISO();

  const streamFilePath = path.join(__dirname, '../../../logs', fileDate, fileName);

  // Create the directory if it doesn't exist
  if (!fs.existsSync(path.dirname(streamFilePath))) {
    fs.mkdirSync(path.dirname(streamFilePath), { recursive: true });
  }

  // create the file if it doesn't exist
  if (!fs.existsSync(streamFilePath)) {
    fs.writeFileSync(streamFilePath, '');
  }

  return streamFilePath;
}

function isErrorProps(props?: OptionalProps & ErrorProps): props is ErrorProps {
  if (props && props.error && typeof props.error !== 'string') {
    return true;
  }

  return false;
}
