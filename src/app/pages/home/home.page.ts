import {Component, OnDestroy, OnInit} from '@angular/core';
import {ParkingLotService} from '../../services/parking/parking-lot.service';
import {Usage} from '../../model/Usage';
import {ProfileService} from '../../services/user/profile.service';
import {Person} from '../../model/Person';
import {Constants} from '../../model/Constants';
import {LoadingController, ToastController} from '@ionic/angular';
import * as moment from 'moment';
import * as _ from 'lodash';
import USAGE = Constants.USAGE;
import {AuthService} from '../../services/user/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  public usr: Person;
  public todaysUsage: Usage;
  public loading: HTMLIonLoadingElement;
  public today: string;
  public subs: any[] = [];

  constructor(private parkingCtrl: ParkingLotService,
              private profileCtrl: ProfileService,
              private authCtrl: AuthService,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController) {

  }

  ngOnInit() {
    this.today = moment().format('ddd DD MMM YYYY');
    this.subs.push(this.profileCtrl.getUserProfile().valueChanges().subscribe((snap) => {
      this.usr = new Person();
      this.usr.uid = this.authCtrl.currUserId;
      this.usr.source(snap);
      this.setTodaysUsage();
    }));
  }

  ngOnDestroy(): void {
    _.forEach(this.subs, (item) => {
      item.unsubscribe();
    });
  }

  async parking(): Promise<void> {
    if (this.todaysUsage && this.todaysUsage.usage === USAGE.PARKING) {
      // If the usage is already recorded then don't do anything
      return;
    }
    const usg = new Usage();
    usg.source({
      usageDate: moment().format('YYYYMMDD'),
      user: this.usr.uid,
      company: this.usr.commuteDetails.companyName,
      parkingSpot: this.usr.commuteDetails.parkingSpot,
      usage: USAGE.PARKING,
      responseTime: moment().format('YYYYMMDD HH:mm:ss')
    });
    this.parkingCtrl.updateUsage(this.todaysUsage, usg).then(() => {
      this.toastCtrl.create({
        message: `Spot ${usg.parkingSpot} recorded as ${usg.usage}`,
        duration: 1500,
        cssClass: 'toast toast-success',
        position: 'top'
      }).then((toast) => {
        this.loading.dismiss();
        toast.present();
      });
    }).catch((error) => {
      this.toastCtrl.create({
        message: `Error: ${error}`,
        duration: 1500,
        cssClass: 'toast toast-error',
        position: 'top'
      }).then((toast) => {
        this.loading.dismiss();
        toast.present();
      });
    });
    this.setTodaysUsage();
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
  }

  async freeSpace(): Promise<void> {
    if (this.todaysUsage && this.todaysUsage.usage === USAGE.FREE) {
      // If the usage is already recorded then don't do anything
      return;
    }
    const usg = new Usage();
    usg.source({
      usageDate: moment().format('YYYYMMDD'),
      user: this.usr.uid,
      company: this.usr.commuteDetails.companyName,
      parkingSpot: this.usr.commuteDetails.parkingSpot,
      usage: USAGE.FREE,
      responseTime: moment().format('YYYYMMDD HH:mm:ss')
    });

    this.parkingCtrl.updateUsage(this.todaysUsage, usg).then(() => {
      this.toastCtrl.create({
        message: `Spot ${usg.parkingSpot} recorded as ${usg.usage}`,
        duration: 1500,
        cssClass: 'toast toast-success',
        position: 'top'
      }).then((toast) => {
          this.loading.dismiss();
          toast.present();
        });
    });
    this.setTodaysUsage();
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
  }

  private setTodaysUsage(): void {
    const usg = new Usage();
    usg.source({
      usageDate: moment().format('YYYYMMDD'),
      user: this.usr.uid,
      company: this.usr.commuteDetails.companyName,
      parkingSpot: this.usr.commuteDetails.parkingSpot,
      usage: USAGE.FREE,
      responseTime: moment().format('YYYYMMDD HH:mm:ss')
    });

    const sub = this.parkingCtrl.getTodaysUsage(usg.getPath()).valueChanges().subscribe((snap2) => {
      sub.unsubscribe();
      if (snap2 != null) {
        this.todaysUsage = new Usage();
        this.todaysUsage.source(snap2);
      }
    });
  }
}
