import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingSpacesPage } from './parking-spaces.page';

describe('ParkingSpacesPage', () => {
  let component: ParkingSpacesPage;
  let fixture: ComponentFixture<ParkingSpacesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParkingSpacesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkingSpacesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
