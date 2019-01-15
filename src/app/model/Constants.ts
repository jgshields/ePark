export namespace Constants {
  export class USAGE {
    public static readonly FREE = 'Free';
    public static readonly SHARING = 'Sharing';
    public static readonly NO_RESPONSE = 'No Response';
    public static readonly REQUEST = 'Request';
    public static readonly VISITOR = 'Visitor';
    public static readonly PARKING = 'Parking';
    public static readonly ASSIGNED = 'Assigned';
    public static readonly UNASSIGNED = 'Unassigned';
  }

  export class FILTER {
    public static readonly ALL = 'All';
  }

  export class REQUEST {
    public static readonly REQUEST_OPEN = 'Open';
    public static readonly REQUEST_PARKING = 'Parking';
    public static readonly REQUEST_CLOSED = 'Closed';
  }

  export class ISOWEEK {
    public static readonly MONDAY = 1;
    public static readonly TUESDAY = 2;
    public static readonly WEDNESDAY = 3;
    public static readonly THURSDAY = 4;
    public static readonly FRIDAY = 5;
    public static readonly SATURDAY = 6;
    public static readonly SUNDAY = 7;
  }

  export class AVATAR {
    public static readonly MALE = '../../../assets/imgs/MaleAvatar.png';
    public static readonly FEMALE = '../../../assets/imgs/FemaleAvatar.png';
  }

  export class USERTYPE {
    public static readonly COMPANY_ADMIN = 'COMPANY_ADMIN';
    public static readonly ADMIN = 'ADMIN';
    public static readonly USER = 'USER';
  }

  export class STATTYPE {
    public static readonly CALENDAR = 'CALENDAR';
    public static readonly WEEKDAY = 'WEEKDAY';
    public static readonly ALL = 'ALL';
    public static readonly WEEKEND = 'WEEKEND';
  }

  export class UTILITY {
    public static readonly HIGH_UNICODE = '\uf8ff';
  }
}
