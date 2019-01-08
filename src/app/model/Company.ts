import IDBConnector = db.IDBConnector;
import {ParkingSpot} from './ParkingSpot';

export class Company implements IDBConnector {
  public name: string;
  public parkingSpots: ParkingSpot[];

  constructor() {
    this.parkingSpots = [];
  }

  getPath(): string {
    return `/companies/${this.name}`;
  }

  sink(): any {
    const res: any = {};
    res.spaces = this.parkingSpots;
    return res;
  }

  source(data: any): void {
    this.name = data.name;
    if (data.spaces) {
      this.parkingSpots = data.spaces.slice();
    }
  }
}
