import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { StartChatDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async startChat(@Body() body: StartChatDto): Promise<string> {
    const { user_id, content } = body;

    if (!user_id || !content) {
      throw new HttpException(
        'user_id와 content는 필수입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const response = await this.chatService.startChat(user_id, content);
      return response;
    } catch (error) {
      console.error('ChatController error:', error);
      throw new HttpException(
        '채팅 처리 실패',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
