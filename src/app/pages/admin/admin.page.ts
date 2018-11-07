import { Component, OnInit } from '@angular/core';
import {ParkingLotService} from '../../services/parking/parking-lot.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Company} from '../../model/Company';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  public loading: HTMLIonLoadingElement;
  companies: Observable<any[]>;
  constructor(private parkingCtrl: ParkingLotService,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController) { }

  ngOnInit() {
    this.companies = this.parkingCtrl.getCompanies().snapshotChanges().pipe(
      map((changes => changes.map(c => ({id: c.key, name: c.payload.val()}))))
    );
  }

  resetStats(): void {
    this.parkingCtrl.runStatsJob();
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
            const company: Company = new Company();
            company.name = data.name;
            this.parkingCtrl.addCompany(company);
          }
        }
      ]
    });
    await alert.present();
  }
}
