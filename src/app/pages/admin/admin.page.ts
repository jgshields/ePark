import { Component, OnInit } from '@angular/core';
import {ParkingLotService} from '../../services/parking/parking-lot.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Company} from '../../model/Company';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  public loading: HTMLIonLoadingElement;
  public companies: Observable<any[]>;

  constructor(private parkingCtrl: ParkingLotService,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private routeCtrl: Router) { }

  ngOnInit() {
    this.companies = this.parkingCtrl.getCompanies().snapshotChanges().pipe(
        map((changes) => changes.map((c) => ({name: c.payload.val().displayName, count: c.payload.val().count}))));
  }

  async resetStats(): Promise<any> {
    this.parkingCtrl.runStatsJob().then(() => {
      this.loading.dismiss();
      this.toastCtrl.create({
        message: `Stats Setup Completed`,
        duration: 1500,
        cssClass: 'toast toast-success',
        position: 'top'
      }).then((toast) => {
        toast.present();
      });
    });
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
  }

  createUsages(): void {
  }

  manageParkingSpaces(company: any): void {
    this.parkingCtrl.setNavParams('company', company.name);
    this.routeCtrl.navigate(['parking-spaces']);
  }

  async addCompany(): Promise<any> {
    const name = '';
    const alert = await this.alertCtrl.create({
      subHeader: 'Add Company',
      inputs: [
        {
          type: 'text',
          name: 'name',
          placeholder: 'Company Name',
          value: name
        }
      ],
      buttons: [
        {text: 'Cancel'},
        {text: 'Save',
          handler: data => {
            this.parkingCtrl.addCompany(data.name).then(() => {
              this.toastCtrl.create({
                message: `New Company ${data.name} Added`,
                duration: 1500,
                cssClass: 'toast toast-success',
                position: 'top'
              }).then((toast) => {
                toast.present();
              });
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
