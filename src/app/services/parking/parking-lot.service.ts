import {Injectable} from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import {Usage} from '../../model/Usage';
import { AngularFireList } from '@angular/fire/database';
import {Constants} from '../../model/Constants';
import {Person} from '../../model/Person';
import {Company} from '../../model/Company';
import {Calendar} from '../../model/Calendar';
import * as moment from 'moment';
import {Usages} from '../../model/Usages';

@Injectable({
  providedIn: 'root'
})
export class ParkingLotService {

  private readonly navParams: any;

  constructor(private afDb: AngularFireDatabase) {
    this.navParams = {};
  }

  private runUserStatsJob(usages: Usages): any {
    const stats = {};
    return stats;
  }

  public setNavParams(key: string, value: string): void {
    this.navParams[key] = value;
  }

  public getNavParam(key: string): string {
    return this.navParams[key];
  }
  public getTodaysUsage(path: string): AngularFireObject<any> {
    return this.afDb.object(path);
  }

  public updateUsage(currUsage: Usage, usage: Usage): Promise<any> {
    return this.afDb.object(usage.getPath()).update(usage.sink()).then(() => {
      this.updateParkingStats(currUsage, usage);
      if (usage.usage === Constants.USAGE.PARKING) {
        const lastParkingDate: any = {};
        lastParkingDate['lastParkingdate'] = usage.usageDate;
        this.afDb.object(`stats/users/${usage.user}`).update(lastParkingDate);
      }
    });
  }

  public addCompany(company: string): Promise<void> {
    const c: any = {};
    const key = company.toLowerCase(); // always save the key as lowercase to avoid case sensitivity on the searches
    c[key] = {};
    c[key].count = 0;
    c[key].displayName = company;
    return this.afDb.object('companies').update(c);
  }

  public getCompanies(): AngularFireList<any> {
    return this.afDb.list('companies');
  }

  public searchCompanies(searchStr: string): AngularFireList<any>  {
    console.log(`Searching: ${searchStr}`);
    return this.afDb.list('/companies', ref => ref.orderByKey().startAt(searchStr)
        .endAt(searchStr + Constants.UTILITY.HIGH_UNICODE)
        .limitToFirst(10));
  }

  public searchParkingSpots(company: string, searchStr: string): AngularFireList<any>  {
    console.log(`Searching: ${searchStr} ${searchStr + Constants.UTILITY.HIGH_UNICODE} ${company.toLowerCase()}`);
    return this.afDb.list(`/companies/${company.toLowerCase()}/spaces`, ref => ref.orderByChild('id').startAt(searchStr)
        .endAt(searchStr + Constants.UTILITY.HIGH_UNICODE)
        .limitToFirst(10));
  }

  public getSpaces(company: string): AngularFireList<any> {
    return this.afDb.list(`companies/${company}/spaces`);
  }

  public addSpace(company: string, spaceId: string): Promise<any> {
    const parkingSpace: any = {};
    parkingSpace[spaceId] = {};
    parkingSpace[spaceId].assignedTo = Constants.USAGE.UNASSIGNED;
    parkingSpace[spaceId].id = spaceId;
    return this.afDb.object(`companies/${company.toLowerCase()}/spaces`).update(parkingSpace).then(() => {
      this.incrementStatistic(`companies/${company}/count`);
    });
  }

  public getUsages(usr: Person): AngularFireList<any> {
    const path = `usage/${usr.commuteDetails.companyName}/${usr.uid}`;
    return this.afDb.list(path);
  }

  public getParkingStats(path: string): AngularFireList<any> {
    return this.afDb.list(path);
  }

  public runStatsJob(): Promise<any> {
    return this.getUsagesForStats().then((usgs) => {
      const usages: Usages = usgs;
      const companyStats = this.runCompanyStatsJob(usages);
      const userStats = this.runUserStatsJob(usages);
      this.afDb.object('stats').remove().then(() => {
        this.afDb.object('').set('stats');
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
