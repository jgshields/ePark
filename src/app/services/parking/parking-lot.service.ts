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
import ThenableReference = firebase.database.ThenableReference;

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

  addCompany(company: Company): ThenableReference {
    return this.afDb.list('company').push(company.name);
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
      const path = '/company';
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
  private updateUserParkingStats(currUsage: Usage, usage: Usage): void {
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
  }

  private updateCompanyParkingStats(currUsage: Usage, usage: Usage, dateToUpdate: string): void {
    if (!currUsage) {
      // first time in. no usage exists.
      if (usage.usage === Constants.USAGE.FREE) {
        this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/${Constants.USAGE.FREE}`);
        // if the update is happening at a monthly or a yearly level
        if (dateToUpdate.length !== 8) {
          if (Calendar.isWeekend(usage.usageDate)) {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekends/${Constants.USAGE.FREE}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekdays/${Constants.USAGE.FREE}`);
          }
        }
      } else {
        this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/${Constants.USAGE.PARKING}`);
        if (dateToUpdate.length !== 8) {
          if (Calendar.isWeekend(usage.usageDate)) {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekends/${Constants.USAGE.PARKING}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekdays/${Constants.USAGE.PARKING}`);
          }
        }
      }
    } else {
      // if we are parking and a record has already been written for that user on that day...
      if (usage.usage === Constants.USAGE.PARKING && currUsage.usage === Constants.USAGE.FREE) {
        this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/${Constants.USAGE.FREE}`);
        this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/${Constants.USAGE.PARKING}`);
        if (dateToUpdate.length !== 8) {
          if (Calendar.isWeekend(usage.usageDate)) {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekends/${Constants.USAGE.PARKING}`);
            this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekends/${Constants.USAGE.FREE}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekdays/${Constants.USAGE.PARKING}`);
            this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekdays/${Constants.USAGE.FREE}`);
          }
        }
      }
      // if we are not parking and a record has already been written for that user on that day...
      if (usage.usage === Constants.USAGE.FREE && currUsage.usage === Constants.USAGE.PARKING) {
        this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/${Constants.USAGE.FREE}`);
        this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/${Constants.USAGE.PARKING}`);
        if (dateToUpdate.length !== 8) {
          if (Calendar.isWeekend(usage.usageDate)) {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekends/${Constants.USAGE.FREE}`);
            this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekends/${Constants.USAGE.PARKING}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekdays/${Constants.USAGE.FREE}`);
            this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/weekdays/${Constants.USAGE.PARKING}`);
          }
        }
      }
    }
  }

  private updateParkingStats(currUsage: Usage, usage: Usage): void {
    // update the parking stats for the user
    this.updateUserParkingStats(currUsage, usage);
    // update the daily parking stats
    this.updateCompanyParkingStats(currUsage, usage, moment(usage.usageDate).format('YYYYMMDD'));
    // update the monthly parking stats
    this.updateCompanyParkingStats(currUsage, usage, moment(usage.usageDate).format('YYYYMM'));
    // update the annual parking stats
    this.updateCompanyParkingStats(currUsage, usage, moment(usage.usageDate).format('YYYY'));
  }
}
