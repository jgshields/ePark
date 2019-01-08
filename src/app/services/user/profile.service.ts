import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import {Person} from '../../model/Person';
import * as firebase from 'firebase';
import {Constants} from '../../model/Constants';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private user: Person = new Person();
  public currentUser: firebase.User;

  constructor(private afDb: AngularFireDatabase, private afAuth: AngularFireAuth) {
    this.afAuth.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUser = user;
        this.user.uid = user.uid;
        this.afDb.object(this.user.getPath()).valueChanges().subscribe((usrSnap) => {
          this.user.source(usrSnap);
        });
      }
    });
  }

  getUserProfile(): AngularFireObject<any> {
    return this.afDb.object(this.user.getPath());
  }

  updateName(firstName: string, lastName: string): Promise<any> {
    return this.afDb.object(this.user.getPath()).update({firstName, lastName});
  }

  updateTenureStartDate(date: string): Promise<any> {
    console.log(`tenureStartDate: ${date}`);
    return this.afDb.object(this.user.getPath()).update({tenureStartDate: date});
  }


  updateDOB(birthDate: any): Promise<any> {
    return this.afDb.object(this.user.getPath()).update({birthDate});
  }

  updateEmail(newEmail: string, password: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(this.currentUser.email, password);
    return this.currentUser.reauthenticateAndRetrieveDataWithCredential(credential).then(() => {
      this.currentUser.updateEmail(newEmail).then(() => {
        this.afDb.object(this.user.getPath()).update({email: newEmail});
      }).catch((error) => {
        console.error(error);
      });
    });
  }

  updatePassword(newPassword: string, oldPassword: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(this.currentUser.email, oldPassword);
    return this.currentUser.reauthenticateAndRetrieveDataWithCredential(credential).then(() => {
      this.currentUser.updatePassword(newPassword).then(() => {
        console.log('Password Updated');
      }).catch((error) => {
        console.error(error);
      });
    });
  }

  updateParkingSpot(parkingSpot: string): Promise<any> {
    this.user.commuteDetails.parkingSpot = parkingSpot;
    return this.afDb.object(this.user.getPath().concat('/commuteDetails')).update(this.user.commuteDetails).then(() => {
      this.afDb.object(`companies/${this.user.commuteDetails.companyName.toLowerCase()}/spaces/${parkingSpot}`)
          .update({assignedTo: this.user.uid});
    });
  }

  updateCompany(companyName: string): Promise<any> {
    if (this.user.commuteDetails.companyName !== companyName) {
      const spotToClear: any = {};
      spotToClear[this.user.commuteDetails.parkingSpot] = Constants.USAGE.UNASSIGNED;
      this.user.commuteDetails.companyName = companyName;
      this.user.commuteDetails.parkingSpot = '';
      return this.afDb.object(this.user.getPath().concat('/commuteDetails')).update(this.user.commuteDetails).then(() => {
        this.afDb.object(`/companies/${companyName.toLowerCase()}`).update(spotToClear);
      });
    }
  }

  updateVehicleDetails(vehicle: string): Promise<any> {
    this.user.commuteDetails.vehicle = vehicle;
    return this.afDb.object(this.user.getPath().concat('/commuteDetails')).update(this.user.commuteDetails);
  }

}
