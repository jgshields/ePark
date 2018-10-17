import IDBConnector = db.IDBConnector;
import * as _ from 'lodash';
import {UserStat} from './UserStat';

export class UserStats implements IDBConnector {
  uid: string;
  monthlyStats: UserStat[] = [];

  constructor(_uid: string) {
    this.uid = _uid;
  }

  public addMonth(stat: UserStat): void {
    this.monthlyStats.push(stat);
  }

  getPath(): string {
    return `stats/users/${this.uid}`;
  }

  sink(): any {
  }

  source(data: any): void {
    _.forEach(data, (item) => {
      const stat: UserStat = new UserStat(item);
      this.addMonth(stat);
    });
  }

}
