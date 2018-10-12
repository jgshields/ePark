import { Injectable } from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {AngularFireDatabase} from 'angularfire2/database';
import {Person} from '../../model/Person';
import {Observable} from 'rxjs';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public currUser: Observable<firebase.User | null>;
  public currUserId: string;

  constructor(private afAuth: AngularFireAuth, private afDb: AngularFireDatabase) {
  }

  loginUser(person: Person, password: string): Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(person.email, password).then((user) => {
      this.currUser = this.afAuth.authState;
    });
  }

  resetPassword(email: string): Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<void> {
    return this.afAuth.auth.signOut().then(() => {
      this.currUserId = undefined;
    });
  }

  signupUser(person: Person, password: string): Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(person.email, password).then((newUser) => {
      this.newSignup();
      this.currUserId = newUser.user.uid;
      person.uid = this.currUserId;
      this.afDb.object(person.getPath()).set(person.sink());
    });
  }

  private newSignup(): Promise<any> {
    return this.afDb.object('stats/users/signedUp').query.ref.transaction((signedUp) => {
      if (signedUp === null) {
        return signedUp = 1;
      } else {
        return signedUp + 1;
      }
    });
  }
}
