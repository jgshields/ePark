import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from './guards/user/auth.guard';
import {AdminGuard} from './guards/user/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' , canActivate: [AuthGuard]},
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'profile', loadChildren: './pages/profile/profile.module#ProfilePageModule', canActivate: [AuthGuard]},
  { path: 'reset-password', loadChildren: './pages/reset-password/reset-password.module#ResetPasswordPageModule'},
  { path: 'signup', loadChildren: './pages/signup/signup.module#SignupPageModule' },
  { path: 'admin', loadChildren: './pages/admin/admin.module#AdminPageModule', canActivate: [AuthGuard, AdminGuard]},
  { path: 'calendar', loadChildren: './pages/calendar/calendar.module#CalendarPageModule' , canActivate: [AuthGuard]},
  { path: 'parking-spaces', loadChildren: './pages/parking-spaces/parking-spaces.module#ParkingSpacesPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
