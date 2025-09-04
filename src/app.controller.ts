import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { OpenAI } from 'openai';
import { RealtimeCallIncomingWebhookEvent } from 'openai/resources/webhooks';
import { Request, Response } from 'express';
import { PhoneService } from './phone/phone.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly phoneService: PhoneService,
  ) {}
  private readonly client = new OpenAI();
  private readonly webhookSecret = process.env.OPENAI_WEBHOOK_VERIFICATION_KEY;

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: Request, @Res() res: Response) {
    try {
      const event = await this.client.webhooks.unwrap(
        req.body,
        req.headers,
        this.webhookSecret,
      );

      const body: RealtimeCallIncomingWebhookEvent = req.body;

      if (body.type === 'realtime.call.incoming') {
        await this.phoneService.handleIncomingCall();
      }
      console.log(event);
      return 'pong';
    } catch (e) {
      if (e instanceof OpenAI.InvalidWebhookSignatureError) {
        console.error('Invalid signature', e);
        throw new UnauthorizedException('Invalid signature');
      } else {
        throw e;
      }
    }
  }
}
