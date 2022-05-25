import { Service } from 'typedi';
import { VesperService } from './service';

@Service()
export class PolygonVesperService extends VesperService {
  protected get baseUrl() {
    return 'https://api-polygon.vesper.finance';
  }
}
