import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { PhoneService } from './phone.service';
import { CreatePhoneDto } from './dto/create-phone.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';

@WebSocketGateway()
export class PhoneGateway {
  constructor(private readonly phoneService: PhoneService) {}

  @SubscribeMessage('createPhone')
  create(@MessageBody() createPhoneDto: CreatePhoneDto) {
    return this.phoneService.create(createPhoneDto);
  }

  @SubscribeMessage('findAllPhone')
  findAll() {
    return this.phoneService.findAll();
  }

  @SubscribeMessage('findOnePhone')
  findOne(@MessageBody() id: number) {
    return this.phoneService.findOne(id);
  }

  @SubscribeMessage('updatePhone')
  update(@MessageBody() updatePhoneDto: UpdatePhoneDto) {
    return this.phoneService.update(updatePhoneDto.id, updatePhoneDto);
  }

  @SubscribeMessage('removePhone')
  remove(@MessageBody() id: number) {
    return this.phoneService.remove(id);
  }
}
