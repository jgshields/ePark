import * as moment from 'moment';
import * as _ from 'lodash';
import {Moment} from 'moment';
import {Constants} from './Constants';

export class Calendar {
  public today: Moment;
  public currMonth: Moment;
  public weeks: Date[][] = [[]];
  public weekdays: string[] = [];

  constructor () {
    this.today = moment();
    this.currMonth = moment().startOf('month');
    // shift the weekdays array so that monday is the first day
    this.weekdays = moment.weekdaysMin();
    const sun: string = this.weekdays[0];
    this.weekdays = _.tail(this.weekdays);
    this.weekdays.push(sun);

    this.setupCalendar();
  }

  public static isWeekend(dateToCheck: any): boolean {
    return (moment(dateToCheck).isoWeekday() === Constants.ISOWEEK.SATURDAY
        || moment(dateToCheck).isoWeekday() === Constants.ISOWEEK.SUNDAY);
  }

  public static isDateToday(dateToCheck: Date): boolean {
    const dtToChk = moment(dateToCheck);
    const today = moment();
    return dtToChk.isSame(today, 'day');
  }

  private setupCalendar() {
    this.weeks = [[]];
    // find the first day of the month
    const startOfMonthDay: number = this.currMonth.isoWeekday();
    const endDate: Moment = moment(this.currMonth).endOf('month');

    let firstDay: Moment;
    let week: Date[] = [];
    const endOfMonthDay: number = endDate.isoWeekday();

    // fill the first week
    if (startOfMonthDay === Constants.ISOWEEK.MONDAY) {
      firstDay = moment(this.currMonth);
    } else {
      firstDay = moment(this.currMonth).add(Constants.ISOWEEK.MONDAY - startOfMonthDay, 'day');
    }

    if (endOfMonthDay !== Constants.ISOWEEK.SUNDAY) {
      endDate.add(Constants.ISOWEEK.SUNDAY - endOfMonthDay, 'day');
    }

    let i = 0;
    do {
      // create each week for the monthly view
      do {
        week.push(firstDay.toDate());
        i++;
        firstDay.add(1, 'day');
      }while (i < 7);
      this.weeks.push(week);
      week = [];
      i = 0;
    } while (firstDay.isSameOrBefore(endDate));
  }

  public changeMonth(increment: number): void {
    this.currMonth = moment(this.currMonth).add(increment, 'month');
    this.setupCalendar();
  }

}
