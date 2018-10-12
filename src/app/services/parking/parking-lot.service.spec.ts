import { TestBed, inject } from '@angular/core/testing';

import { ParkingLotService } from './parking-lot.service';

describe('ParkingLotService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ParkingLotService]
    });
  });

  it('should be created', inject([ParkingLotService], (service: ParkingLotService) => {
    expect(service).toBeTruthy();
  }));
});
