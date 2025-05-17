import { IsString, IsIn, MaxLength } from 'class-validator';

export class StartChatDto {
  @IsString()
  user_id: string;

  @IsString()
  @MaxLength(1000)
  content: string;
}

export class SaveChatDto {
  @IsString()
  user_id: string;

  @IsString()
  chat_id: string;

  @IsIn(['user', 'model'])
  role: string;

  @IsString()
  content: string;
}

export class ChatHistoryDto {
  role: string;
  content: string;
}
