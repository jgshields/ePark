import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ToastController} from '@ionic/angular';
import {ParkingLotService} from '../../services/parking/parking-lot.service';
import {ProfileService} from '../../services/user/profile.service';
import {Person} from '../../model/Person';
import {Calendar} from '../../model/Calendar';
import {Usages} from '../../model/Usages';
import {Usage} from '../../model/Usage';
import {Constants} from '../../model/Constants';
import {UserStats} from '../../model/UserStats';
import { Chart } from 'chart.js';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit, OnDestroy {
  @ViewChild ('piechart') piechart;
  doughnutChart: Chart;
  public calendar: Calendar;
  public usages: Usages;
  public user: Person;
  public stats: UserStats;
  private subs: any[] = [];
  public stat = 'CALENDAR';

  constructor(private toastCtrl: ToastController, private parkingCtrl: ParkingLotService,
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

  showUsageData(): void {
    if (this.doughnutChart) {
      this.doughnutChart.destroy();
    }
    this.doughnutChart = new Chart(this.piechart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [Constants.USAGE.FREE, Constants.USAGE.PARKING, Constants.USAGE.NO_RESPONSE],
        datasets: [{
          label: 'Usage',
          data: this.stats.getStatsForMonth(this.calendar.currMonth.format('YYYYMM'), this.stat),
          backgroundColor: [
            '#b7ced5',
            '#68ff11',
            '#d5434e'
          ],
          hoverBackgroundColor: [
            '#d5d5d5',
            '#75ff8f',
            '#d56e70'
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
    if (moment(day).isSameOrAfter(this.calendar.today, 'day')) {
      if (this.user.commuteDetails.parkingSpot) {
        this.toggleFreeSpace(day);
      }
    }
  }

  ngOnDestroy(): void {
    _.forEach(this.subs, (item) => {
      item.unsubscribe();
    });
  }

  private toggleFreeSpace(day: Date): Promise<any> {
    let title = 'Space Free';
    const usg = new Usage();
    usg.source({
      usageDate: moment(day).format('YYYYMMDD'),
      user: this.user.uid,
      company: this.user.commuteDetails.companyName,
      parkingSpot: this.user.commuteDetails.parkingSpot,
      usage: Constants.USAGE.FREE,
      responseTime: moment().format('YYYYMMDD HH:mm:ss')
    });
    // if the day clicked is today or in the future AND it has not been previously set to FREE then allow the user to set their
    // space as free.
    // If it has been set to FREE then allow the user to cancel this
    const currUsage: Usage = this.usages.getUsageForDate(day);
    if (currUsage) {
      if (currUsage.usage === Constants.USAGE.FREE) {
        title = 'Free Space Cancelled';
        usg.usage = Constants.USAGE.PARKING;
      }
    }
    return this.parkingCtrl.updateUsage(currUsage, usg).then(() => {
      this.toastCtrl.create({
        message: `${title} for ${moment(day).format('DDD MM, YYYY')}`,
        duration: 1500,
        cssClass: 'toast toast-success',
        position: 'top'
      }).then((toast) => {
        toast.present();
      });
    });
  }
}
