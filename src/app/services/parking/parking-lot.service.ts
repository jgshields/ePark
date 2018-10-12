import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import {Usage} from '../../model/Usage';
import {Company} from '../../model/Company';
import { AngularFireList } from '@angular/fire/database';
import * as moment from 'moment';
import {Constants} from '../../model/Constants';
import USAGE = Constants.USAGE;
import {Person} from '../../model/Person';

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
    this.afDb.list('companies').push(company.name);
  }

  getCompanies(): AngularFireList<any> {
    return this.afDb.list('companies');
  }

  getUsages(usr: Person): AngularFireList<any> {
    const path = `usage/${usr.commuteDetails.companyName}/${usr.uid}`;
    return this.afDb.list(path);
  }

  private updateParkingStats(currUsage: Usage, usage: Usage): void {

    const datesToUpdate: any[] = [];
    datesToUpdate.push(moment().format('YYYYMMDD'));
    datesToUpdate.push(moment().format('YYYYMM'));
    datesToUpdate.push(moment().format('YYYY'));

    // loop thru the dates call the transaction
    for (let i = 0; i < 3; i++) {
      if (!currUsage) {
        // first time in. no usage exists.
        if (usage.usage === Constants.USAGE.FREE) {
          this.afDb.object(`stats/${usage.company}/${datesToUpdate[i]}/${Constants.USAGE.FREE}`).query.ref.transaction((free) => {
            if (usage === null) {
              return free = 1;
            } else {
              return free + 1;
            }
          });
        } else {
          this.afDb.object(`stats/${usage.company}/${datesToUpdate[i]}/${Constants.USAGE.PARKING}`).query.ref.transaction((parking) => {
            if (usage === null) {
              return parking = 1;
            } else {
              return parking + 1;
            }
          });
        }
      } else {
        // if we are parking and a record has already been written for that user on that day...
        if (usage.usage === Constants.USAGE.PARKING && currUsage.usage === Constants.USAGE.FREE) {
          // the user is reversing their decision so the old stats need to be decremented
          this.afDb.object(`stats/${usage.company}/${datesToUpdate[i]}/${USAGE.FREE}`).query.ref.transaction((free) => {
            if (free === null) {
              return free = 0;
            } else {
              return free - 1;
            }
          });
          this.afDb.object(`stats/${usage.company}/${datesToUpdate[i]}/${USAGE.PARKING}`).query.ref.transaction((parking) => {
            if (parking === null) {
              return parking = 1;
            } else {
              return parking + 1;
            }
          });
        }
        // if we are not parking and a record has already been written for that user on that day...
        if (usage.usage === Constants.USAGE.FREE && currUsage.usage === Constants.USAGE.PARKING) {
          // the user is reversing their decision so the old stats need to be decremented
          this.afDb.object(`stats/${usage.company}/${datesToUpdate[i]}/${USAGE.FREE}`).query.ref.transaction((free) => {
            if (free === null) {
              return free = 1;
            } else {
              return free + 1;
            }
          });
          this.afDb.object(`stats/${usage.company}/${datesToUpdate[i]}/${USAGE.PARKING}`).query.ref.transaction((parking) => {
            if (parking === null) {
              return parking = 0;
            } else {
              return parking - 1;
            }
          });
        }
      }
    }
  }
}
