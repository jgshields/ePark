import IDBConnector = db.IDBConnector;
import {ParkingSpot} from './ParkingSpot';

export class Company implements IDBConnector {
  public name: string;
  public id: string;
  public parkingSpots: ParkingSpot[];

  constructor() {
    this.parkingSpots = [];
  }

  getPath(): string {
    return `/company/${this.id}`;
  }

  sink(): any {
    const res: any = {};
    res.name = this.name;
    res.id = this.id;
    return res;
  }

  source(data: any): void {
    this.id = data.key;
    this.name = data.payload.val();
  }
}
