import { TestBed } from '@angular/core/testing';

import { MovimientoCajaService } from './movimiento-caja.service';

describe('MovimientoCajaService', () => {
  let service: MovimientoCajaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovimientoCajaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
