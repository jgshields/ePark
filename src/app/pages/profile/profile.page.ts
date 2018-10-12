import { Component, OnInit } from '@angular/core';
import {AlertController} from '@ionic/angular';
import {ProfileService} from '../../services/user/profile.service';
import {Router} from '@angular/router';
import {AuthService} from '../../services/user/auth.service';
import {Person} from '../../model/Person';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  public person: Person;

  constructor(private alertCtrl: AlertController,
              private authService: AuthService,
              private profileService: ProfileService,
              private router: Router) { }

  ngOnInit() {
    this.profileService.getUserProfile().valueChanges().subscribe( (snap) => {
      this.person = new Person();
      this.person.source(snap);
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

  async updateCommuteDetails(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: 'Commute Details',
      inputs: [
        {
          type: 'text',
          name: 'vehicle',
          label: 'Vehicle Registration',
          value: this.person.commuteDetails.vehicle
        },
        {
          type: 'text',
          name: 'companyName',
          value: this.person.commuteDetails.companyName
        },
        {
          type: 'text',
          name: 'parkingSpot',
          label: 'Parking Spot',
          value: this.person.commuteDetails.parkingSpot
        }
      ],
      buttons: [
        {text: 'Cancel'},
        {text: 'Save',
          handler: data => {
            this.profileService.updateCommuteDeatils(data.vehicle, data.companyName, data.parkingSpot);
          }}
      ]
    });
    await alert.present();
  }


}
