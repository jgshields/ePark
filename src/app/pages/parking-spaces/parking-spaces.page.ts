import { Component, OnInit } from '@angular/core';
import {ParkingLotService} from '../../services/parking/parking-lot.service';
import {AlertController, ToastController} from '@ionic/angular';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-parking-spaces',
  templateUrl: './parking-spaces.page.html',
  styleUrls: ['./parking-spaces.page.scss'],
})
export class ParkingSpacesPage implements OnInit {
  public company: string;
  public parkingSpaces: Observable<any>;

  constructor(private parkingCtrl: ParkingLotService,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController) {
    this.company = this.parkingCtrl.getNavParam('company');
    this.parkingSpaces = this.parkingCtrl.getSpaces(this.company).snapshotChanges().pipe(
        map((changes) => changes.map((c) => ({name: c.key, assignedTo: c.payload.val().assignedTo}))));
  }

  ngOnInit() {
  }

  async addParkingSpace(): Promise<void> {
    const alert = await this.alertCtrl.create({
      inputs: [
        {
          type: 'text',
          name: 'spaceId',
          placeholder: 'New Space Id'
        }
      ],
      buttons: [
        {text: 'Cancel'},
        {
          text: 'Save',
          handler: data => {
            this.parkingCtrl.addSpace(this.company, data.spaceId).then(() => {
              this.showToast(`Parking Space Added: ${data.spaceId}`);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private showToast(message: string): void {
    this.toastCtrl.create({
      message: message,
      duration: 1500,
      cssClass: 'toast toast-success',
      position: 'top'
    }).then((toast) => {
      toast.present();
    });
  }
}
