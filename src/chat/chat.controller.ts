import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('example')
  async getExample(): Promise<string> {
    return await this.chatService.getExample();
  }
}
