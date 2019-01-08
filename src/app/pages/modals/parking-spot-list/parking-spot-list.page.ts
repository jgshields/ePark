import { Component, OnInit } from '@angular/core';
import {LoadingController, ModalController, NavParams, ToastController} from '@ionic/angular';
import {ProfileService} from '../../../services/user/profile.service';
import {ParkingLotService} from '../../../services/parking/parking-lot.service';

@Component({
  selector: 'app-parking-spot-list',
  templateUrl: './parking-spot-list.page.html',
  styleUrls: ['./parking-spot-list.page.scss'],
})
export class ParkingSpotListPage implements OnInit {
  public spots: any[];
  public searchStr: string;
  public company: string;
  public loading: HTMLIonLoadingElement;
  private subs: any[];

  constructor(private navParams: NavParams,
              private modalCtrl: ModalController,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              private profileCtrl: ProfileService,
              private parkingCtrl: ParkingLotService) { }

  ngOnInit() {
    this.subs = [];
    this.company = this.navParams.get('companyName');
  }

  public search(): void {
    this.spots = [];
    if (this.searchStr.length > 0) {
      this.subs.push(this.parkingCtrl.searchParkingSpots(this.company, this.searchStr).snapshotChanges().subscribe((snap) => {
        console.log(snap.length);
        snap.map((item) => {
          console.log(item.key);
          const spot: any = {};
          spot.id = item.key;
          spot.assignedTo = item.payload.val().assignedTo;
          this.spots.push(spot);
        });
      }));
    }
  }

  public dismiss(): void {
    this.subs.forEach((item) => {
      item.unsubscribe();
    });
    this.modalCtrl.dismiss();
  }

  async selectSpot(spot: string): Promise<any> {
    this.spots = [];
    this.profileCtrl.updateParkingSpot(spot).then( () => {
      this.toastCtrl.create({
        message: `Parking Spot: ${spot} assigned`,
        duration: 1500,
        cssClass: 'toast toast-success',
        position: 'top'
      }).then((toast) => {
        this.loading.dismiss();
        toast.present();
        this.dismiss();
      });
    });
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
  }
}
