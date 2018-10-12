import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {ProfileService} from '../../services/user/profile.service';
import {Person} from '../../model/Person';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private profileCtrl: ProfileService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve, reject) => {
      this.profileCtrl.getUserProfile().valueChanges().subscribe((snap) => {
        const user: Person = new Person();
        user.source(snap);
        resolve(user.isAdmin());
      });
    });
  }
}
