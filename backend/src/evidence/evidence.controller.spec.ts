import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';

describe('EvidenceController', () => {
  let controller: EvidenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvidenceController],
      providers: [
        {
          provide: EvidenceService,
          useValue: {
            create: jest.fn(),
            findByIncident: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EvidenceController>(EvidenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
