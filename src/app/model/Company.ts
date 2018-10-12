import IDBConnector = db.IDBConnector;

export class Company implements IDBConnector {
  public name: string;
  public id: string;

  constructor(_name: string) {
    this.name = _name;
  }

  getPath(): string {
    return `/companies/${this.id}`;
  }

  sink(): any {
    const res: any = {};
    res.name = this.name;
    res.id = this.id;
    return res;
  }

  source(data: any): void {
    this.name = data.name;
    this.id = data.id;
  }
}
