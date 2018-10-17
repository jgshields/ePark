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
  public createdDatetime: string;
  public tenureStartDate: string;
  public commuteDetails: CommuteDetails;
  public joinDatetime: string;
  public userType: string;

  constructor() {
    this.commuteDetails = new CommuteDetails();
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
    if (this.joinDatetime) {
      res.joinDatetime = this.joinDatetime;
    }
    if (this.commuteDetails) {
      res.commuteDetails = this.commuteDetails.sink();
    }
    if (this.tenureStartDate) {
      res.tenureStartDate = this.tenureStartDate;
    }
    res.isAdmin = this.userType;
    return res;
  }

  source(data: any): void {
    if (data) {
      this.email = data.email;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
      this.fullName = `${this.firstName} ${this.lastName}`;
      this.createdDatetime = moment(data.createDatetime).format( 'YYYYMMDD HH:mm:ss');
      this.joinDatetime = data.joinDatetime;
      this.commuteDetails = data.commuteDetails;
      this.tenureStartDate = data.tenureStartDate;
      this.uid = data.uid;
      this.userType = data.userType;
    }
  }
}
