import { Service } from 'typedi';
import { VesperService } from './service';

@Service()
export class AvalancheVesperService extends VesperService {
  protected get baseUrl() {
    return 'https://api-avalanche.vesper.finance';
  }
}
