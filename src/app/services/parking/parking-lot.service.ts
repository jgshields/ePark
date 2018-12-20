import {ANALYZE_FOR_ENTRY_COMPONENTS, Injectable} from '@angular/core';
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
import {compareNumbers} from '@angular/compiler-cli/src/diagnostics/typescript_version';
import {Usages} from '../../model/Usages';
import {v} from '@angular/core/src/render3';

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
    return this.getUsagesForStats().then((usgs) => {
      const usages: Usages = usgs;
      const companyStats = this.runCompanyStatsJob(usages);
      const userStats = this.runUserStatsJob(usages);
      this.afDb.object('stats').remove().then(() => {
        this.afDb.object('/').set('stats');
      });
    });
  }

  private getUsagesForStats(): Promise<any> {
    const companies: any[] = [];
    let path: string;
    const usages: Usages = new Usages();
    return new Promise<any>((resolve) => {
      this.getCompanies().query.once('value', (snap) => {
        for (const item in snap.val()) {
          if (snap.val().hasOwnProperty(item)) {
            // establish the company object in the array of companies
            const company: any = new Company();
            companies.push(company);
            company.id = item;
            company.name = snap.val()[item];
            // now for each company get the users in that company that have usages recorded
            path = `usage/${company.name}`;
            company.usagePaths = [];
            this.afDb.list(path).query.once('value', (snap2) => {
              for (const user in snap2.val()) {
                if (snap2.val().hasOwnProperty(user)) {
                  // now populate the usages
                  for (const usg in snap2.val()[user]) {
                    if (snap2.val()[user].hasOwnProperty(usg)) {
                      // now populate the usages
                      const usage: Usage = new Usage();
                      usage.source(snap2.val()[user][usg]);
                      usage.usageDate = usg;
                      usages.addUsage(usage);
                    }
                  }
                }
              }
              resolve(usages);
            });
          }
        }
      });
    });
  }
  private runCompanyStatsJob(usages: Usages): any {
    const stats = {};

    for (let i = 0; i < usages.numUsages(); i++) {
      const usg = usages.getUsage(i);
      const month = moment(usg.usageDate, 'YYYYMMDD').format('YYYYMM');
      const year = moment(usg.usageDate, 'YYYYMMDD').format('YYYY');
      if (!stats[usg.company]) {
        stats[usg.company] = {};
      }
      if (!stats[usg.company][year]) {
        stats[usg.company][year] = {
          'Free': 0,
          'Parking': 0,
          'Weekends': {
            'Free': 0,
            'Parking': 0
          },
          'Weekdays': {
            'Free': 0,
            'Parking': 0
          }
        };
      }
      if (!stats[usg.company][month]) {
        stats[usg.company][month] = {
          'Free': 0,
          'Parking': 0,
          'Weekends': {
            'Free': 0,
            'Parking': 0
          },
          'Weekdays': {
            'Free': 0,
            'Parking': 0
          }
        };
      }
      if (!stats[usg.company][usg.usageDate]) {
        stats[usg.company][usg.usageDate] = {
          'Free': 0,
          'Parking': 0,
        };
      }
      stats[usg.company][usg.usageDate][usg.usage] ++;
      stats[usg.company][month][usg.usage] ++;
      stats[usg.company][year][usg.usage] ++;
      if (Calendar.isWeekend(usg.usageDate)) {
        stats[usg.company][year]['Weekends'][usg.usage] ++;
        stats[usg.company][month]['Weekends'][usg.usage] ++;
      } else {
        stats[usg.company][year]['Weekdays'][usg.usage] ++;
        stats[usg.company][month]['Weekdays'][usg.usage] ++;
      }
    }
    return stats;
  }

  private runUserStatsJob(usages: Usages): any {
    const stats = {};
    return stats;
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
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekends/${Constants.USAGE.FREE}`);
        } else {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekdays/${Constants.USAGE.FREE}`);
        }
      } else {
        this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.FREE}`);
        // if it's a weekday update the weekdays stats
        if (Calendar.isWeekend(usage.usageDate)) {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekends/${Constants.USAGE.FREE}`);
        } else {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekdays/${Constants.USAGE.FREE}`);
        }
      }
    } else {
      // if we are parking and a record has already been written for that user on that day...
      if (usage.usage === Constants.USAGE.PARKING && currUsage.usage === Constants.USAGE.FREE) {
        this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.FREE}`);
        this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.PARKING}`);
        if (Calendar.isWeekend(usage.usageDate)) {
          this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekends/${Constants.USAGE.FREE}`);
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekends/${Constants.USAGE.PARKING}`);
        } else {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekdays/${Constants.USAGE.PARKING}`);
          this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekdays/${Constants.USAGE.FREE}`);
        }
      }
      // if we are not parking and a record has already been written for that user on that day...
      if (usage.usage === Constants.USAGE.FREE && currUsage.usage === Constants.USAGE.PARKING) {
        this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.FREE}`);
        this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/${Constants.USAGE.PARKING}`);
        if (Calendar.isWeekend(usage.usageDate)) {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekends/${Constants.USAGE.FREE}`);
          this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekends/${Constants.USAGE.PARKING}`);
        } else {
          this.incrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekdays/${Constants.USAGE.FREE}`);
          this.decrementStatistic(`stats/users/${usage.user}/${moment().format('YYYYMM')}/Weekdays/${Constants.USAGE.PARKING}`);
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
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekends/${Constants.USAGE.FREE}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekdays/${Constants.USAGE.FREE}`);
          }
        }
      } else {
        this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/${Constants.USAGE.PARKING}`);
        if (dateToUpdate.length !== 8) {
          if (Calendar.isWeekend(usage.usageDate)) {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekends/${Constants.USAGE.PARKING}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekdays/${Constants.USAGE.PARKING}`);
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
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekends/${Constants.USAGE.PARKING}`);
            this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekends/${Constants.USAGE.FREE}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekdays/${Constants.USAGE.PARKING}`);
            this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekdays/${Constants.USAGE.FREE}`);
          }
        }
      }
      // if we are not parking and a record has already been written for that user on that day...
      if (usage.usage === Constants.USAGE.FREE && currUsage.usage === Constants.USAGE.PARKING) {
        this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/${Constants.USAGE.FREE}`);
        this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/${Constants.USAGE.PARKING}`);
        if (dateToUpdate.length !== 8) {
          if (Calendar.isWeekend(usage.usageDate)) {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekends/${Constants.USAGE.FREE}`);
            this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekends/${Constants.USAGE.PARKING}`);
          } else {
            this.incrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekdays/${Constants.USAGE.FREE}`);
            this.decrementStatistic(`stats/${usage.company}/${dateToUpdate}/Weekdays/${Constants.USAGE.PARKING}`);
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
