import IDBConnector = db.IDBConnector;

export class Usage implements IDBConnector {
  public user: string;
  public usageDate: string;
  public parkingSpot: string;
  public company: string;
  public responseTime: string;
  public usage: string;

  constructor() {
  }

  getPath(): string {
    return `usage/${this.company}/${this.user}/${this.usageDate}`;
  }

  toString(): string {
    return JSON.stringify(this.sink());
  }

  sink(): any {
    const res: any = {};
    res.user = this.user;
    res.usage = this.usage;
    res.parkingSpot = this.parkingSpot;
    res.company = this.company;
    res.responseTime = this.responseTime;
    return res;
  }

  source(data: any): void {
    this.user = data.user;
    this.usage = data.usage;
    this.usageDate = data.usageDate;
    this.parkingSpot = data.parkingSpot;
    this.company = data.company;
    this.responseTime = data.responseTime;
  }
}
