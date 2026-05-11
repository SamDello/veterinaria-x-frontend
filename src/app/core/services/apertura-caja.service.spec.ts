import { TestBed } from '@angular/core/testing';

import { AperturaCajaService } from './apertura-caja.service';

describe('AperturaCajaService', () => {
  let service: AperturaCajaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AperturaCajaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
