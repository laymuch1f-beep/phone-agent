import { Injectable, Logger } from '@nestjs/common';
import WebSocket from 'ws';
import axios from 'axios';

@Injectable()
export class PhoneService {
  private readonly logger = new Logger(PhoneService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY!;
  private sockets = new Map<string, WebSocket>();

  private get authHeader() {
    return { Authorization: `Bearer ${this.apiKey}` };
  }

  async acceptCall(
    callId: string,
    opts?: { instructions?: string; model?: string },
  ) {
    const body = {
      type: 'realtime',
      model: opts?.model || 'gpt-realtime',
      output_modalities: ['audio'],
      audio: {
        input: {
          format: 'pcm16',
          turn_detection: { type: 'semantic_vad', create_response: true },
        },
        output: {
          format: 'g711_ulaw',
          voice: 'coral',
          speed: 1.0,
        },
      },
      instructions: opts?.instructions || `You are a helpful assistant for a restaurant, we always availability for bookings.
         Speak clearly and briefly.
          Confirm understanding before taking actions.
          Your default language is English, unless a user uses a different language`,
    };

    try {
      const response = await axios.post(
        `https://api.openai.com/v1/realtime/calls/${callId}/accept`,
        body,
        { 
          headers: { 
            ...this.authHeader, 
            'Content-Type': 'application/json' 
          } 
        },
      );
      this.logger.log(`✅ Call ${callId} accepted successfully`);
      return response.data;
    } catch (e: any) {
      this.logger.error(`❌ Error accepting call ${callId}:`, e.message);
      if (e.response) {
        this.logger.error('Response data:', e.response.data);
        this.logger.error('Response status:', e.response.status);
      }
      throw e;
    }
  }

  async connect(callId: string) {
    const url = `wss://api.openai.com/v1/realtime?call_id=${encodeURIComponent(callId)}`;

    const ws = new WebSocket(url, {
      headers: this.authHeader,
    });

    this.sockets.set(callId, ws);

    ws.on('open', () => {
      this.logger.log(`🔌 WS open for call ${callId}`);

      const responseCreate = {
        type: 'response.create',
        response: {
          instructions: `Greet the user and ask them what they need assistance with.
             Use English as a default language.
             For booking cancellation, ask for booking reference and name only.
             If a user is silent for more than 3 seconds, ask if they are still there or if they need help with anything`,
        },
      };
      ws.send(JSON.stringify(responseCreate));
    });

    ws.on('message', (data) => {
      try {
        const text = data.toString();
        this.logger.debug(`📨 WS message (${callId}): ${text}`);
      } catch (e) {
        this.logger.error(`Failed to parse WS message for ${callId}`, e);
      }
    });

    ws.on('close', (code, reason) => {
      this.logger.log(
        `🔌 WS closed for ${callId}: code=${code} reason=${reason.toString()}`,
      );
      this.sockets.delete(callId);
    });

    ws.on('error', (err) => {
      this.logger.error(`❌ WS error for ${callId}: ${err.message}`);
    });
  }

  async handleIncomingCall(callId: string) {
    this.logger.log(`📞 Handling incoming call: ${callId}`);
    
    try {
      // 1. Accept the call via OpenAI API
      await this.acceptCall(callId);
      
      // 2. Start WebSocket connection in background
      setImmediate(() => {
        this.connect(callId).catch((e) =>
          this.logger.error(
            `❌ Failed to connect WS for ${callId}: ${e.message}`,
          ),
        );
      });

      // 3. ⭐ CRITICAL: Return expected response to OpenAI webhook
      return {
        control: {
          action: 'accept',
          parameters: {
            voice: 'coral',
            instructions: `You are a helpful assistant for a restaurant, we always availability for bookings.
               Speak clearly and briefly.
                Confirm understanding before taking actions.
                Your default language is English, unless a user uses a different language`,
            turn_detection: {
              type: 'server_vad',
            }
          }
        }
      };
    } catch (error) {
      this.logger.error(`❌ Failed to handle call ${callId}:`, error);
      throw error; // Let the controller handle the error
    }
  }

  async terminateCall(callId: string) {
    try {
      await axios.post(
        `https://api.openai.com/v1/realtime/calls/${callId}/hangup`,
        null,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`✅ Call ${callId} terminated`);
      return { ok: true };
    } catch (e: any) {
      this.logger.error(
        `❌ Hangup failed for ${callId}:`,
        e.response?.status,
        e.response?.data ?? e.message,
      );
      return { ok: false, error: e.response?.data ?? e.message };
    }
  }

  close(callId: string) {
    const sock = this.sockets.get(callId);
    if (sock && sock.readyState === WebSocket.OPEN) sock.close(1000, 'done');
    this.sockets.delete(callId);
  }
}