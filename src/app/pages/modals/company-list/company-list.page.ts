import {Component, OnInit} from '@angular/core';
import {ParkingLotService} from '../../../services/parking/parking-lot.service';
import {LoadingController, ModalController, ToastController} from '@ionic/angular';
import {ProfileService} from '../../../services/user/profile.service';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.page.html',
  styleUrls: ['./company-list.page.scss'],
})
export class CompanyListPage implements OnInit {

  public companies: string[];
  public searchStr: string;
  public loading: HTMLIonLoadingElement;
  private subs: any[];
  constructor(private parkingCtrl: ParkingLotService,
              private modalCtrl: ModalController,
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController,
              private profileCtrl: ProfileService) { }


  ngOnInit() {
    this.subs = [];
    this.searchStr = '';
  }

  search(): void {
    this.companies = [];
    if (this.searchStr.length >= 2) {
      this.subs.push(this.parkingCtrl.searchCompanies(this.searchStr.toLowerCase()).snapshotChanges().subscribe( (snap) => {
        snap.map((cmpny) => {
          this.companies.push(cmpny.payload.val().displayName);
        });
      }));
    }
  }

  dismiss(): void {
    this.subs.forEach((item) => {
      item.unsubscribe();
    });
    this.modalCtrl.dismiss();
  }

  async selectCompany(company: string): Promise<any> {
    this.companies = [];
    console.log(`updating company ${company}`);
    this.profileCtrl.updateCompany(company).then(() => {
      this.toastCtrl.create({
        message: `Company: ${company} Selected`,
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
