import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Chart } from 'chart.js';
import {ParkingLotService} from '../../services/parking/parking-lot.service';
import {ProfileService} from '../../services/user/profile.service';
import {Person} from '../../model/Person';
import {Calendar} from '../../model/Calendar';
import {Usages} from '../../model/Usages';
import {Usage} from '../../model/Usage';
import {Constants} from '../../model/Constants';
import * as _ from 'lodash';
import * as moment from 'moment';
import {UserStats} from '../../model/UserStats';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit, OnDestroy {
  @ViewChild ('doughnutCanvas') doughnutCanvas;
  doughnutChart: any;
  public calendar: Calendar;
  public usages: Usages;
  public user: Person;
  public stats: UserStats;
  private subs: any[] = [];
  public stat = 'calendar';

  constructor(private parkingCtrl: ParkingLotService,
              private profileCtrl: ProfileService) { }

  ngOnInit() {
    this.calendar = new Calendar();
    this.user = new Person();
    this.usages = new Usages();
    this.subs.push(this.profileCtrl.getUserProfile().valueChanges().subscribe((usrSnap) => {
      this.user.source(usrSnap);
      this.subs.push(this.parkingCtrl.getUsages(this.user).snapshotChanges().subscribe((usgSnap) => {
        if (!usgSnap) {
          return;
        }
        usgSnap.map((item) => {
          const usg: Usage = new Usage();
          usg.source(item.payload.val());
          usg.usageDate = item.key;
          this.usages.addUsage(usg);
        });
      }));

      this.stats = new UserStats(this.user.uid);
      this.subs.push(this.parkingCtrl.getParkingStats(this.stats.getPath()).snapshotChanges().subscribe((statSnap) => {
        this.stats.source(statSnap);
      }));
    }));
  }

  nextMonth(): void {
    this.calendar.changeMonth(1);
  }

  previousMonth(): void {
    this.calendar.changeMonth(-1);
  }

  showWeekdayData(): void {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
          ]
        }]
      }
    });
  }

  setCalendarClass(day: Date): any {
    const usg: Usage = this.usages.getUsageForDate(day);
    let cls: any = {};
    if (!usg) {
      cls = {
        'calendar-cell': !this.usages.isDateInPeriod(day),
        'calendar-cell-outside-period': moment(day).isBefore(moment(this.usages.firstUsageDate)),
        'calendar-cell-today': moment(day).isSame(this.calendar.today, 'day'),
        'calendar-cell-not-current-month': !moment(day).isSame(this.calendar.currMonth, 'month'),
        'lot-parking': false,
        'lot-free': false,
        'lot-no-response': this.usages.isDateInPeriod(day),
        'lot-sharing': false,
        'lot-request': false
      };
    } else {
      cls = {
        'calendar-cell': !this.usages.isDateInPeriod(day),
        'calendar-cell-outside-period': moment(day).isBefore(moment(this.usages.firstUsageDate)),
        'calendar-cell-today': moment(day).isSame(this.calendar.today, 'day'),
        'calendar-cell-not-current-month': !moment(day).isSame(this.calendar.currMonth, 'month'),
        'lot-parking': usg.usage === Constants.USAGE.PARKING,
        'lot-free': usg.usage === Constants.USAGE.FREE,
        'lot-no-response': usg.usage === undefined && this.usages.isDateInPeriod(day),
        'lot-sharing': usg.usage === Constants.USAGE.SHARING,
        'lot-request': usg.usage === Constants.USAGE.REQUEST
      };
    }
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
