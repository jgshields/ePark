import { Component, OnInit } from '@angular/core';
import {LoadingController, ModalController, NavParams, ToastController} from '@ionic/angular';
import {ProfileService} from '../../../services/user/profile.service';
import {Person} from '../../../model/Person';
import {Constants} from '../../../model/Constants';

@Component({
  selector: 'app-person-list',
  templateUrl: './person-list.page.html',
  styleUrls: ['./person-list.page.scss'],
})
export class PersonListPage implements OnInit {
  public people: any[];
  public searchStr: string;
  public currAssignedPerson: Person;
  public parkingSpot: string;
  public loading: HTMLIonLoadingElement;
  private subs: any[];

  constructor(private modalCtrl: ModalController,
              private navParams: NavParams,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              private profileCtrl: ProfileService) { }

  ngOnInit() {
    this.subs = [];

    this.profileCtrl.getUser(this.navParams.get('uid')).query.once('value', (snap) => {
      this.currAssignedPerson = new Person();
      this.currAssignedPerson.source(snap.val());
    });
    this.parkingSpot = this.navParams.get('spotId');
  }

  public search(): void {
    this.people = [];
    if (this.searchStr.length > 2) {
      this.subs.push(this.profileCtrl.search(this.searchStr.toLowerCase()).snapshotChanges().subscribe((snap) => {
        snap.map((item) => {
          console.log(item.key);
          const user: Person = new Person();
          user.source(item.payload.val());
          if (user.uid !== this.currAssignedPerson.uid) {
            this.people.push(user);
          }
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

  async selectPerson(uid: string): Promise<any> {
    this.profileCtrl.assignParkingSpot(uid, this.parkingSpot).then(() => {
      this.toastCtrl.create({
        message: `Parking Spot: ${this.parkingSpot} assigned to ${uid}`,
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

  async releaseSpace(): Promise<any> {
    this.profileCtrl.releaseSpace().then( () => {
      this.toastCtrl.create({
        message: `Parking Spot: ${this.parkingSpot} released`,
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
