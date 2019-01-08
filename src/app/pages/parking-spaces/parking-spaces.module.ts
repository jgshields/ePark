import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ParkingSpacesPage } from './parking-spaces.page';

const routes: Routes = [
  {
    path: '',
    component: ParkingSpacesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ParkingSpacesPage]
})
export class ParkingSpacesPageModule {}
