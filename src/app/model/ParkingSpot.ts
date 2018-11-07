import IDBConnector = db.IDBConnector;

export class ParkingSpot implements IDBConnector {
  name: string;
  createdDate: string;
  ceaseDate: string;

  getPath(): string {
    return '';
  }

  sink(): any {
  }

  source(data: any): void {
  }
}
