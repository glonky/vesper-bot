import { Service } from 'typedi';
import { VesperService } from './service';

@Service()
export class EthereumVesperService extends VesperService {
  protected get baseUrl() {
    return 'https://api.vesper.finance';
  }
}
