import IDBConnector = db.IDBConnector;
import * as moment from 'moment';
import {CommuteDetails} from './CommuteDetails';
import {Constants} from './Constants';

export class Person implements IDBConnector {
  public lastName: string;
  public firstName: string;
  public email: string;
  public uid: string;
  public fullName: string;
  private createdDatetime: Date;
  public tenureStartDate: Date;
  public commuteDetails: CommuteDetails;
  public userType: string;
  public hasParkingSpot: boolean;

  constructor() {
    this.commuteDetails = new CommuteDetails();
    this.tenureStartDate = moment().toDate();
    this.fullName = '';
    this.hasParkingSpot = false;
  }

  public getCreatedDateTime(format: string): string {
    return moment(this.createdDatetime).format(format);
  }

  public getTenure(): string {
    return moment(this.tenureStartDate, 'YYYYMMDD').fromNow();
  }

  getPath(): string {
    return `/users/${this.uid}`;
  }

  isAdmin(): boolean {
    return (this.userType === Constants.USERTYPE.ADMIN || this.userType === Constants.USERTYPE.COMPANY_ADMIN);
  }

  sink(): any {
    const res: any = {};
    if (this.firstName) {
      res.firstName = this.firstName;
    }
    if (this.lastName) {
      res.lastName = this.lastName;
    }
    if (this.email) {
      res.email = this.email;
    }
    if (this.uid) {
      res.uid = this.uid;
    }
    if (!this.createdDatetime) {
      res.createdDatetime = moment().format('YYYYMMDD HH:mm:ss');
    }
    if (this.commuteDetails) {
      res.commuteDetails = this.commuteDetails.sink();
    }
    res.tenureStartDate = this.tenureStartDate;
    if (this.userType) {
      res.userType = this.userType;
    } else {
      res.userType = Constants.USERTYPE.USER;
    }
    return res;
  }

  source(data: any): void {
    if (data) {
      this.email = data.email;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
      if (this.firstName && this.lastName) {
        this.fullName = `${this.firstName} ${this.lastName}`;
      }
      this.createdDatetime = moment(data.createdDatetime, 'YYYYMMDD HH:mm:ss').toDate();
      this.commuteDetails = data.commuteDetails;
      if (this.commuteDetails.parkingSpot !== Constants.USAGE.NO_SPACE) {
        this.hasParkingSpot = true;
      }
      if (data.tenureStartDate) {
        this.tenureStartDate = data.tenureStartDate;
      }
      this.uid = data.uid;
      this.userType = data.userType;
    }
  }
}
