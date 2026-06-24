import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EvidenceService } from './evidence.service';
import { Evidence } from './schemas/evidence.schema';

describe('EvidenceService', () => {
  let service: EvidenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvidenceService,
        {
          provide: getModelToken(Evidence.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EvidenceService>(EvidenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
