import {Component, OnDestroy, OnInit} from '@angular/core';
import {ParkingLotService} from '../../services/parking/parking-lot.service';
import {ProfileService} from '../../services/user/profile.service';
import {Person} from '../../model/Person';
import {Calendar} from '../../model/Calendar';
import {Usages} from '../../model/Usages';
import {Usage} from '../../model/Usage';
import {Constants} from '../../model/Constants';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit, OnDestroy {
  public calendar: Calendar;
  public usages: Usages;
  public user: Person;
  private subs: any[] = [];
  constructor(private parkingCtrl: ParkingLotService,
              private profileCtrl: ProfileService) { }

  ngOnInit() {
    console.log('in Calendar Page ngOnInit');
    this.calendar = new Calendar();
    this.user = new Person();
    this.usages = new Usages();
    this.subs.push(this.profileCtrl.getUserProfile().valueChanges().subscribe((usrSnap) => {
      this.user.source(usrSnap);
      this.subs.push(this.parkingCtrl.getUsages(this.user).valueChanges().subscribe((usgSnap) => {
        _.forEach(usgSnap, (item) => {
          const usg: Usage = new Usage();
          usg.source(item);
          this.usages.addUsage(usg);
        });
      }));
    }));
  }

  nextMonth() {
    this.calendar.changeMonth(1);
  }

  previousMonth() {
    this.calendar.changeMonth(-1);
  }

  setCalendarClass(day: Date): any {
    const usg: Usage = this.usages.getUsageForDate(day);
    const cls: any = {
      'calendar-cell': usg.usage === Constants.USAGE.NO_RESPONSE && !this.usages.isDateInPeriod(day),
      'calendar-cell-outside-period': moment(day).isBefore(moment(this.usages.firstUsageDate)),
      'calendar-cell-today': moment(day).isSame(this.calendar.today, 'day'),
      'calendar-cell-not-current-month': !moment(day).isSame(this.calendar.currMonth, 'month'),
      'lot-parking': usg.usage === Constants.USAGE.PARKING,
      'lot-free': usg.usage === Constants.USAGE.FREE,
      'lot-no-response': usg.usage === Constants.USAGE.NO_RESPONSE && this.usages.isDateInPeriod(day),
      'lot-sharing': usg.usage === Constants.USAGE.SHARING,
      'lot-request': usg.usage === Constants.USAGE.REQUEST
    };
    return cls;
  }

  manageSpace(day: Date): any {

  }

  ngOnDestroy(): void {
    _.forEach(this.subs, (item) => {
      item.unsubscribe();
    });
  }

}
