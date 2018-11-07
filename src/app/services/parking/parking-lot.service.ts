import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import {Usage} from '../../model/Usage';
import {Company} from '../../model/Company';
import { AngularFireList } from '@angular/fire/database';
import {Constants} from '../../model/Constants';
import {Person} from '../../model/Person';
import {Calendar} from '../../model/Calendar';
import * as moment from 'moment';
import * as _ from 'lodash';
import {async} from 'rxjs/internal/scheduler/async';

@Injectable({
  providedIn: 'root'
})
export class ParkingLotService {

  constructor(private afDb: AngularFireDatabase) {
  }

  getTodaysUsage(path: string): AngularFireObject<any> {
    return this.afDb.object(path);
  }

  updateUsage(currUsage: Usage, usage: Usage): Promise<any> {
    return this.afDb.object(usage.getPath()).update(usage.sink()).then(() => {
      this.updateParkingStats(currUsage, usage);
    });
  }

  addCompany(company: Company): void {
    this.afDb.list('company').push(company.name);
  }

  getCompanies(): AngularFireList<any> {
    return this.afDb.list('company');
  }

  getUsages(usr: Person): AngularFireList<any> {
    const path = `usage/${usr.commuteDetails.companyName}/${usr.uid}`;
    return this.afDb.list(path);
  }

  getParkingStats(path: string): AngularFireList<any> {
    return this.afDb.list(path);
  }

  runStatsJob(): Promise<any> {
    return new Promise<any>(resolve => {
      const path = '/compani';
      this.afDb.list(path).snapshotChanges().subscribe((snap) => {
        _.forEach(snap, (item) => {
          console.log(item.key);
        });
        resolve(true);
      });
    });
  }
  private runUserStatsJob(): void {
    const path = '';
  }

  private runCompanyStatsjob(): void {
    const path = '';
  }

  private incrementStatistic(path: string) {
    this.afDb.object(path).query.ref.transaction((num) => {
      if (num === null) {
        return num = 1;
      } else {
        return num + 1;
      }
    });
  }

  private decrementStatistic(path: string) {
    this.afDb.object(path).query.ref.transaction((num) => {
      if (num === null) {
        return num = 0;
      } else {
        return num - 1;
      }
    });
  }

  private updateParkingStats(currUsage: Usage, usage: Usage): void {
    const datesToUpdate: any[] = [];

    datesToUpdate.push(moment(usage.usageDate).format('YYYYMMDD'));
    datesToUpdate.push(moment(usage.usageDate).format('YYYYMM'));
    datesToUpdate.push(moment(usage.usageDate).format('YYYY'));

    // update the users stats for the month in question.
    if (!currUsage) {
      // first time in. no usage exists.
      if (usage.usage === Constants.USAGE.FREE) {
        this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.FREE}`);
        // if it's a weekday update the weekdays stats
        if (Calendar.isWeekend(usage.usageDate)) {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekends/${Constants.USAGE.FREE}`);
        } else {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekdays/${Constants.USAGE.FREE}`);
        }
      } else {
        this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.FREE}`);
        // if it's a weekday update the weekdays stats
        if (Calendar.isWeekend(usage.usageDate)) {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekends/${Constants.USAGE.FREE}`);
        } else {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekdays/${Constants.USAGE.FREE}`);
        }
      }
    } else {
      // if we are parking and a record has already been written for that user on that day...
      if (usage.usage === Constants.USAGE.PARKING && currUsage.usage === Constants.USAGE.FREE) {
        this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.FREE}`);
        this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.PARKING}`);
        if (Calendar.isWeekend(usage.usageDate)) {
          this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekends/${Constants.USAGE.FREE}`);
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekends/${Constants.USAGE.PARKING}`);
        } else {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekdays/${Constants.USAGE.PARKING}`);
          this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekdays/${Constants.USAGE.FREE}`);
        }
      }
      // if we are not parking and a record has already been written for that user on that day...
      if (usage.usage === Constants.USAGE.FREE && currUsage.usage === Constants.USAGE.PARKING) {
        this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.FREE}`);
        this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.PARKING}`);
        if (Calendar.isWeekend(usage.usageDate)) {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekends/${Constants.USAGE.FREE}`);
          this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekends/${Constants.USAGE.PARKING}`);
        } else {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekdays/${Constants.USAGE.FREE}`);
          this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/weekdays/${Constants.USAGE.PARKING}`);
        }
      }
    }
    // loop thru the dates call the transaction to update the company stats
    for (let i = 0; i < 3; i++) {
      if (!currUsage) {
        // first time in. no usage exists.
        if (usage.usage === Constants.USAGE.FREE) {
          this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/${Constants.USAGE.FREE}`);
          if (Calendar.isWeekend(usage.usageDate)) {
            this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekends/${Constants.USAGE.FREE}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekdays/${Constants.USAGE.FREE}`);
          }
        } else {
          this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/${Constants.USAGE.PARKING}`);
          if (Calendar.isWeekend(usage.usageDate)) {
            this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekends/${Constants.USAGE.PARKING}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekdays/${Constants.USAGE.PARKING}`);
          }
        }
      } else {
        // if we are parking and a record has already been written for that user on that day...
        if (usage.usage === Constants.USAGE.PARKING && currUsage.usage === Constants.USAGE.FREE) {
          this.decrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/${Constants.USAGE.FREE}`);
          this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/${Constants.USAGE.PARKING}`);
          if (Calendar.isWeekend(usage.usageDate)) {
            this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekends/${Constants.USAGE.PARKING}`);
            this.decrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekends/${Constants.USAGE.FREE}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekdays/${Constants.USAGE.PARKING}`);
            this.decrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekdays/${Constants.USAGE.FREE}`);
          }
        }
        // if we are not parking and a record has already been written for that user on that day...
        if (usage.usage === Constants.USAGE.FREE && currUsage.usage === Constants.USAGE.PARKING) {
          this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/${Constants.USAGE.FREE}`);
          this.decrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/${Constants.USAGE.PARKING}`);
          if (Calendar.isWeekend(usage.usageDate)) {
            this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekends/${Constants.USAGE.FREE}`);
            this.decrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekends/${Constants.USAGE.PARKING}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekdays/${Constants.USAGE.FREE}`);
            this.decrementStatistic(`stats/${usage.company}/${datesToUpdate[i]}/weekdays/${Constants.USAGE.PARKING}`);
          }
        }
      }
    }
  }
}
