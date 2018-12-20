import {Usage} from './Usage';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Constants } from './Constants';

// Collection of usage model and summary data
export class Usages {

  public firstUsageDate: Date;
  public lastUsageDate: Date;
  private usages: Usage[] = [];

  constructor() {
  }

  public numUsages(): number {
    return this.usages.length;
  }

  public addUsage(usage: Usage): void {
    this.usages.push(usage);
    this.calculateUsageDates();
  }

  public getUsage(index: number): Usage {
    if (index >= this.usages.length) {
      return null;
    }
    return this.usages[index];
  }

  public removeUsage(usage: Usage): void {
    _.find(this.usages, (item) => {
      return item.usageDate === usage.usageDate;
    }).usage = Constants.USAGE.NO_RESPONSE;
    this.calculateUsageDates();
  }

  private calculateUsageDates(): void {
    // set the limits of the dates
    let usg: Usage = _.maxBy(this.usages, (item) => {
      return moment(item.usageDate, 'YYYYMMDD').toDate();
    });
    this.lastUsageDate = moment(usg.usageDate, 'YYYYMMDD').toDate();

    usg = _.minBy(this.usages, (item) => {
      return moment(item.usageDate, 'YYYYMMDD').toDate();
    });
    this.firstUsageDate = moment(usg.usageDate, 'YYYYMMDD').toDate();

  }

  public isDateInPeriod(dateToCheck: Date): boolean {
    const dtToChk = moment(dateToCheck);
    const today = moment();
    return dtToChk.isSameOrAfter(moment(this.firstUsageDate), 'day') && dtToChk.isSameOrBefore(today, 'day');
  }

  public getUsageForDate(dateToCheck: Date): Usage {
    const day = _.find(this.usages, (usage) => {
      return moment(usage.usageDate).isSame(moment(dateToCheck), 'day');
    });
    return day;
  }
}
