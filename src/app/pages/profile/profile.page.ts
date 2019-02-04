import { Component, OnInit } from '@angular/core';
import {AlertController, ModalController, ToastController} from '@ionic/angular';
import {ProfileService} from '../../services/user/profile.service';
import {AuthService} from '../../services/user/auth.service';
import {Person} from '../../model/Person';
import {ParkingLotService} from '../../services/parking/parking-lot.service';
import * as moment from 'moment';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {CompanyListPage} from '../modals/company-list/company-list.page';
import {ParkingSpotListPage} from '../modals/parking-spot-list/parking-spot-list.page';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})

export class ProfilePage implements OnInit {
  public person: Person;
  public companies: Observable<any[]>;
  public tenureStart: any;
  public today: string;

  constructor(private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              private modalCtrl: ModalController,
              private authService: AuthService,
              private profileService: ProfileService,
              private parkingCtrl: ParkingLotService) { }

  ngOnInit() {
    this.today = moment().format('YYYY-MM-DD');
    this.profileService.getUserProfile().valueChanges().subscribe( (snap) => {
      this.person = new Person();
      if (snap) {
        this.person.source(snap);
        this.tenureStart = moment(this.person.tenureStartDate).format('YYYY-MM-DD');
      } else {
        this.person = null;
      }
    });
    this.companies = this.parkingCtrl.getCompanies().snapshotChanges().pipe(
        map(changes => changes.map(c => ({ name: c.payload.key, ...c.payload.val() }))
        )
    );
  }

  async updateEmail(): Promise<void> {
    const alert = await this.alertCtrl.create({
      inputs: [
        {
          type: 'text',
          name: 'newEmail',
          placeholder: 'Your New Email Address'
        },
        {
          type: 'password',
          name: 'password',
          placeholder: 'Your password'
        }
      ],
      buttons: [
        {text: 'Cancel'},
        {text: 'Save',
          handler: data => {
            this.profileService.updateEmail(data.newEmail, data.password).then(() => {
              this.showToast(`Email Changed: ${data.newEmail}`);
            });
          }}
      ]
    });
    await alert.present();
  }

  async updatePassword(): Promise<void> {
    const alert = await this.alertCtrl.create({
      inputs: [
        {
          type: 'password',
          name: 'oldPassword',
          placeholder: 'Your Old Password'
        },
        {
          type: 'password',
          name: 'newPassword',
          placeholder: 'Your New Password'
        }
      ],
      buttons: [
        {text: 'Cancel'},
        {text: 'Save',
          handler: data => {
            this.profileService.updatePassword(data.newPassword, data.oldPassword).then(() => {
              this.showToast('Password Changed');
            });
          }}
      ]
    });
    await alert.present();
  }

  async updateName(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Your First and Last Name',
      inputs: [
        {
          type: 'text',
          name: 'firstName',
          placeholder: 'Your First Name',
          value: this.person.firstName
        },
        {
          type: 'text',
          name: 'lastName',
          placeholder: 'Your Last Name',
          value: this.person.lastName
        }
      ],
      buttons: [
        {text: 'Cancel'},
        {text: 'Save',
          handler: data => {
            this.profileService.updateName(data.firstName, data.lastName).then(() => {
              this.showToast(`Name Saved: ${data.firstName} ${data.lastName}`);
            });
          }}
      ]
    });
    await alert.present();
  }

  async updateCompany(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CompanyListPage
    });
    await modal.present();
  }

  async updateParkingSpot(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ParkingSpotListPage,
      componentProps: {
        companyName: this.person.commuteDetails.companyName.toLowerCase()
      }
    });
    await modal.present();
  }

  async updateVehicle(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Update Vehicle Details',
      inputs: [
        {
          type: 'text',
          name: 'vehicle',
          value: this.person.commuteDetails.vehicle
        }],
      buttons: [
        {text: 'Cancel'},
        {text: 'Save',
          handler: data => {
            this.profileService.updateVehicleDetails(data.vehicle).then(() => {
              this.showToast(`Vehicle Details Saved: ${data.vehicle}`);
            });
          }}
      ]
    });
    await alert.present();
  }

  updateTenureStartDate(): void {

    if (this.tenureStart) {
      const dt: string = moment()
          .year(this.tenureStart.year.value)
          .month(this.tenureStart.month.value - 1)
          .date(this.tenureStart.day.value).format('YYYYMMDD');      this.profileService.updateTenureStartDate(dt).then(() => {
        this.showToast(`Company Start Date Saved: ${moment(this.tenureStart, 'YYYY-MM-DD').format('DD MMM, YYYY')}`);
      });
    }
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
