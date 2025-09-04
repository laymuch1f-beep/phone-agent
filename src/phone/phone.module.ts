import { Module } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { PhoneGateway } from './phone.gateway';

@Module({
  exports: [PhoneService],
  providers: [PhoneGateway, PhoneService],
})
export class PhoneModule {}
