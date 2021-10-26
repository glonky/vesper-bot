/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */

import util from 'util';
import path from 'path';
import moment from 'moment-timezone';
import pino from 'pino';
import { Service, Inject, ContainerInstance } from 'typedi';
import { merge } from 'lodash';
import { Config } from '../config';

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
  private config!: Config;

  public _logger?: pino.Logger;

  private get logger() {
    if (this._logger) {
      return this._logger;
    }

    const timeFunction = () => `,"time":"${moment().format('HH:mm:ss.SSS')}"`;
    // const traceFile = createStreamFilePath('trace');
    // const debugFile = createStreamFilePath('debug');
    // const infoFile = createStreamFilePath('info');
    // const errorFile = createStreamFilePath('error');

    const streams = [
      { level: 'debug', stream: process.stdout },
      { level: 'error', stream: process.stderr },
      // { level: 'trace', stream: pino.destination(traceFile) },
      // { level: 'debug', stream: pino.destination(debugFile) },
      // { level: 'info', stream: pino.destination(infoFile) },
      // { level: 'error', stream: pino.destination(errorFile) },
    ];

    this._logger = pino(
      {
        // https://github.com/pinojs/pino/blob/master/docs/api.md#options-object
        base: null,
        enabled: this.config.logger.enabled,
        formatters: {
          level(label) {
            return { level: label.toUpperCase() };
          },
        },
        level: this.config.logger.level.toLowerCase() ?? 'info',
        prettyPrint: this.config.logger.prettyPrint ?? this.config.isLocal ?? false,
        timestamp: this.config.logger.timestamp ?? this.config.isLocal ? timeFunction : false,
        // TODO: Put in tokens wildcard here
        // redact: [''],
      },
      // this.config.isDevelopment || this.config.isLocal ? multistream(streams) : undefined,
    );

    // TODO: report error here as well
    // process.on(
    //   'uncaughtException',
    //   pino.final(this._logger, (err, finalLogger) => {
    //     finalLogger.error(err, 'uncaughtException');
    //     process.exit(1);
    //   }),
    // );

    // TODO: report error here as well
    // process.on(
    //   'unhandledRejection',
    //   pino.final(this._logger, (err, finalLogger) => {
    //     finalLogger.error(err, 'unhandledRejection');
    //     process.exit(1);
    //   }),
    // );

    return this._logger;
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

  // TODO: Add an extra param here so that we can pass in trace and debug options to log
  public info(message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) {
    return this.logger.info(this.createMessage(message, optionalProps, loggerProps));
  }

  public log(message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps) {
    return this.logger.log(this.createMessage(message, optionalProps, loggerProps));
  }

  private createMessage(message: string, optionalProps?: OptionalProps, loggerProps?: LoggerProps): any;

  private createMessage(message: string, optionalProps?: OptionalProps & ErrorProps, loggerProps?: LoggerProps): any {
    let depth: null | undefined | number = loggerProps?.deep ?? true ? null : undefined;
    const showHidden = !!(loggerProps?.deep ?? true);

    if (isErrorProps(optionalProps)) {
      depth = this.config.isDevelopment || this.config.isLocal ? 3 : 2;
    }

    const inspectProps = {
      colors: this.config.logger.prettyPrint ?? (this.config.isDevelopment || this.config.isLocal),
      depth,
      showHidden,
      sorted: this.config.isDevelopment || this.config.isLocal,
    };

    const blackList = loggerProps?.blacklist ?? [];
    blackList.push('apolloError', 'botToken', 'token');

    // TODO: Pull this context out to somewhere else
    // const asyncContext = getAsyncContext();

    const propsToLog = merge(
      {
        // awsRequestId: asyncContext?.aws?.lambdaContext?.awsRequestId,
        // containerId: asyncContext?.container?.id,
        // slack: asyncContext?.slack,
        // tenantId: asyncContext?.tenant?.id,
        // userId: asyncContext?.user?.id,
        // xCorrelationId: asyncContext?.aws?.xCorrelationId,
        // xRayTraceId: asyncContext?.aws?.xRayTraceId,
      },
      optionalProps ?? ({} as OptionalProps & ErrorProps),
    );
    // const propsToLog = omitDeep(optionalProps ?? ({} as OptionalProps & ErrorProps), blackList);

    if (this.config.logger.prettyPrint ?? (this.config.isDevelopment || this.config.isLocal)) {
      let result = message;

      Object.entries(propsToLog).forEach(([key, value]) => {
        let inspectedValue = value;

        if (value && !(value instanceof ContainerInstance)) {
          let valueToInspect = value;

          if (key === 'error') {
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
          result = `${result} [${key}: ${inspectedValue}]`;
        }
      });

      return result;
    }

    const result = {
      message,
    } as any;

    Object.entries(propsToLog).forEach(([key, value]) => {
      let inspectedValue = value;

      if (value && !(value instanceof ContainerInstance)) {
        let valueToInspect = value;

        if (key === 'error') {
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
        result[key] = inspectedValue;
      }
    });

    return result;
  }
}

function createStreamFilePath(level: string) {
  const fileDate = moment().tz('utc').startOf('hour').toISOString();

  const streamFilePath = path.join(__dirname, '../../../logs', `${fileDate}/${level}.log`);
  console.log('streamFilePath', streamFilePath);
  return streamFilePath;
}

function isErrorProps(props?: OptionalProps & ErrorProps): props is ErrorProps {
  if (props && props.error && typeof props.error !== 'string') {
    return true;
  }

  return false;
}
