import * as moment from 'moment';
import {Calendar} from './Calendar';

export class UserStat {
  month: string;
  totalFree: number;
  totalParking: number;
  weekendsFree: number;
  weekendsParking: number;
  weekdaysFree: number;
  weekdaysParking: number;

  weekdays: number;
  weekendDays: number;
  daysInMonth: number;
  constructor(snap: any) {
    this.month = snap.key;
    this.totalFree = snap.payload.val().Free;
    this.totalParking = snap.payload.val().Parking;
    this.weekendsFree = snap.payload.val().weekends.Free;
    this.weekendsParking = snap.payload.val().weekends.Parking;
    this.weekdaysFree = snap.payload.val().weekdays.Free;
    this.weekdaysParking = snap.payload.val().weekdays.Parking;

    this.daysInMonth = moment(this.month, 'YYYYMMDD').daysInMonth();
    this.weekdays = Calendar.calculateNumDays(this.month, true);
    this.weekendDays = this.daysInMonth - this.weekdays;
    console.log(`${this.month} ${this.daysInMonth} ${this.weekdays} ${this.weekendDays}`);
  }
}
