import { Component, OnInit } from '@angular/core';
import {AlertController} from '@ionic/angular';
import {ProfileService} from '../../services/user/profile.service';
import {AuthService} from '../../services/user/auth.service';
import {Person} from '../../model/Person';
import {ParkingLotService} from '../../services/parking/parking-lot.service';
import {Company} from '../../model/Company';
import * as _ from 'lodash';
import * as moment from 'moment';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public person: Person;
  public companies: Company[];
  public tenureStart: Date;

  constructor(private alertCtrl: AlertController,
              private authService: AuthService,
              private profileService: ProfileService,
              private parkingService: ParkingLotService) { }

  ngOnInit() {
    this.profileService.getUserProfile().valueChanges().subscribe( (snap) => {
      this.person = new Person();
      this.person.source(snap);
      this.tenureStart = moment(this.person.tenureStartDate, 'YYYYMMDD').toDate();
    });
    this.companies = [];
    this.parkingService.getCompanies().snapshotChanges().subscribe((snap) => {
      _.forEach(snap, (item) => {
        const company: Company = new Company();
        company.source(item);
        this.companies.push(company);
      });
    });
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
            this.profileService.updateEmail(data.newEmail, data.password);
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
            this.profileService.updatePassword(data.newPassword, data.oldPassword);
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
            this.profileService.updateName(data.firstName, data.lastName);
          }}
      ]
    });
    await alert.present();
  }

  async updateCompany(): Promise<void> {
    const radios: any [] = [];
    let i;
    let company: Company;
    for (i = 0; i < this.companies.length; i++) {
      company = this.companies[i];
      if (company.name === this.person.commuteDetails.companyName) {
        radios.push({
          type: 'radio',
          label: company.name,
          value: company.name,
          checked: true
        });
      } else {
        radios.push({
          type: 'radio',
          label: company.name,
          value: company.name,
          checked: false
        });
      }
    }

    const alert = await this.alertCtrl.create(
    {
      subHeader: 'Update Company',
      inputs: radios,
      buttons: [
        {text: 'Cancel'},
        {text: 'Save',
          handler: data => {
            this.profileService.updateCompany(data);
          }}
      ]
    });
    await alert.present();
  }

  async updateParkingSpot(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Update Parking Spot',
      inputs: [
        {
          type: 'text',
          name: 'parkingSpot',
          value: this.person.commuteDetails.parkingSpot
        }
      ],
      buttons: [
        {text: 'Cancel'},
        {text: 'Save',
          handler: data => {
            this.profileService.updateParkingSpot(data.parkingSpot);
          }}
      ]
    });
    await alert.present();
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
            this.profileService.updateVehicleDetails(data.vehicle);
          }}
      ]
    });
    await alert.present();
  }

  updateTenureStartDate(): void {
    this.profileService.updateTenureStartDate(this.tenureStart);
  }
}
