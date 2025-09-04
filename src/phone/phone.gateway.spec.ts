import { Test, TestingModule } from '@nestjs/testing';
import { PhoneGateway } from './phone.gateway';
import { PhoneService } from './phone.service';

describe('PhoneGateway', () => {
  let gateway: PhoneGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneGateway, PhoneService],
    }).compile();

    gateway = module.get<PhoneGateway>(PhoneGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
