import { Inject, Service } from 'typedi';
import { Config } from './config';

@Service()
export class VesperService {
  @Inject()
  private config!: Config;

  private fetch<T>(endpoint: string): Promise<T> {
    const stage = this.config.isProduction ? 'prod' : 'beta';

    return fetch(`/${endpoint}?stages=${stage}`).then((response: any) => response.json()) as Promise<T>;
  }
}
