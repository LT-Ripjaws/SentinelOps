import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { Incident } from '../incidents/schemas/incident.schema';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(Incident.name),
          useValue: {
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
