import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonListPage } from './person-list.page';

describe('PersonListPage', () => {
  let component: PersonListPage;
  let fixture: ComponentFixture<PersonListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
