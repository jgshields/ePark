import * as moment from 'moment';
import {Calendar} from './Calendar';

export class UserStat {
  month: string;
  totalFree = 0;
  totalParking = 0;
  totalNoResponse = 0;

  weekendsFree = 0;
  weekendsParking = 0;
  weekendsNoResponse = 0;

  weekdaysFree = 0;
  weekdaysParking = 0;
  weekdaysNoResponse = 0;

  weekdays = 0;
  weekendDays = 0;
  daysInMonth = 0;

  constructor(snap: any) {
    this.month = snap.key;

    this.daysInMonth = moment(this.month, 'YYYYMMDD').daysInMonth();
    this.weekdays = Calendar.calculateNumDays(this.month, true);
    this.weekendDays = this.daysInMonth - this.weekdays;

    if (snap.payload.val().Free) {
      this.totalFree = snap.payload.val().Free;
    }
    if (snap.payload.val().Parking) {
      this.totalParking = snap.payload.val().Parking;
    }
    this.totalNoResponse = this.daysInMonth - (this.totalFree + this.totalParking);

    if (snap.payload.val().weekends && snap.payload.val().weekends.Free) {
      this.weekendsFree = snap.payload.val().weekends.Free;
    }
    if (snap.payload.val().weekends && snap.payload.val().weekends.Parking) {
      this.weekendsParking = snap.payload.val().weekends.Parking;
    }
    this.weekendsNoResponse = this.weekendDays - (this.weekendsFree + this.weekendsParking);

    if (snap.payload.val().weekdays && snap.payload.val().weekdays.Free) {
      this.weekdaysFree = snap.payload.val().weekdays.Free;
    }
    if (snap.payload.val().weekdays && snap.payload.val().weekdays.Parking) {
      this.weekdaysParking = snap.payload.val().weekdays.Parking;
    }
    this.weekdaysNoResponse = this.weekdays - (this.weekdaysFree + this.weekdaysParking);
  }

  getTotalStats(): number[] {
    const res: number[] = [];
    res.push(this.totalFree);
    res.push(this.totalParking);
    res.push(this.totalNoResponse);
    return res;
  }

  getWeekdayStats(): number[] {
    const res: number[] = [];
    res.push(this.weekdaysFree);
    res.push(this.weekdaysParking);
    res.push(this.weekdaysNoResponse);
    return res;
  }

  getWeekendStats(): number[] {
    const res: number[] = [];
    res.push(this.weekendsFree);
    res.push(this.weekendsParking);
    res.push(this.weekendsNoResponse);
    return res;
  }
}
