import IDBConnector = db.IDBConnector;
import * as _ from 'lodash';
import {UserStat} from './UserStat';
import {Constants} from './Constants';

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

  getStatsForMonth(month: string, type: Constants.STATTYPE): number[] {
    // get the stats for that month
    const stat: UserStat = _.find(this.monthlyStats, (item) => {
      return item.month === month;
    });

    // If there are stats for that month return the one of a relevant type
    if (stat) {
      switch (type) {
        case Constants.STATTYPE.ALL:
          return stat.getTotalStats();
        case Constants.STATTYPE.WEEKDAY:
          return stat.getWeekdayStats();
        case Constants.STATTYPE.WEEKEND:
          return stat.getWeekendStats();
        default:
          return stat.getWeekdayStats();
      }
    } else {
      // If not create one with no data
      const stats: number[] = [];
      stats.push(0);
      stats.push(0);
      stats.push(0);
      return stats;
    }
  }

  sink(): any {
  }

  source(data: any): void {
    _.map(data, (item) => {
      const stat: UserStat = new UserStat(item);
      this.addMonth(stat);
    });
  }

}
