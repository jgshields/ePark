import IDBConnector = db.IDBConnector;
import {Constants} from './Constants';

export class CommuteDetails implements IDBConnector {
  public vehicle: string;
  public companyName: string;
  public parkingSpot: string;

  constructor() {
    this.vehicle = '';
    this.companyName = '';
    this.parkingSpot = Constants.USAGE.NO_SPACE;
  }

  getPath(): string {
    return '/commuteDetails';
  }

  sink(): any {
    const res: any = {};
    res.vehicle = this.vehicle;
    res.companyName = this.companyName;
    res.parkingSpot = this.parkingSpot;
    return res;
  }

  source(data: any): void {
    this.vehicle = data.vehicle;
    this.companyName = data.companyName;
    this.parkingSpot = data.parkingSpot;
  }

}
