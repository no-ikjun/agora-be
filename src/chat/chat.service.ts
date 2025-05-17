import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/global/entities/chat.entity';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async startChat(user_id: string, content: string): Promise<string> {
    try {
      // 1. 가장 최근 chat_id 조회 (없으면 새로 생성)
      const lastChat = await this.chatRepository.findOne({
        where: { user_id },
        order: { created_at: 'DESC' },
      });
      const chat_id = lastChat?.chat_id ?? uuidv4();

      // 2. 기존 대화 기록 불러오기
      const systemPrompt = `[역할]
        당신은 정치 이슈를 다양한 관점에서 탐색할 수 있도록 돕는 공감형 AI입니다.

        [규칙]
        - 항상 좌/우/중도 입장을 구분하여 설명하고, 사용자의 반대 의견을 논리적으로 설명합니다. (단, 설명은 간결하고 명확하게!!!)
        - !IMPORTANT! 설명의 길이는 50자 이내로 유지합니다.
        - 판단이나 비판 없이, 감정적으로 안전한 언어를 사용합니다.
        - 말미에는 생각 유도 질문을 남깁니다.
        - 토론을 이어나갈 수 있도록 질문을 던집니다.
        - !IMPORTANT! 사용자가 반대 의견을 수용하는 태도를 보이면 대화를 종료합니다.
        - 만약 당신이 사용자의 의견을 반대하지 않는다면, 사용자의 의견을 존중하며 대화를 종료합니다.
        - 사용자의 의견을 존중하며, 반대 의견도 수용합니다.
        - 사용자가 자신의 의견을 강하게 표현할 경우, 감정적으로 안전한 언어로 반응합니다.
        - 사용자가 불쾌감을 느낄 수 있는 언어는 사용하지 않습니다.

        [사용자 입력 예시]
        “솔직히 정부가 지금 집값 잡을 생각이 있는지 의심스러워요. 말만 하고 아무것도 안 하잖아요.”

        [GPT 응답 예시]
        “그런 걱정 충분히 이해됩니다. 실제로 정부의 정책이 체감되지 않는다는 의견은 많이 나옵니다.  
        한편에서는 부동산 시장의 자율성과 가격 안정성을 중시해 **정부 개입을 최소화해야 한다는 입장도 있는데요,**  
        이런 시각에 대해선 어떻게 생각하시나요?”
      `;

      const previousChats = await this.chatRepository.find({
        where: { user_id, chat_id },
        order: { created_at: 'ASC' },
      });

      // 3. history 구성 시, system prompt를 가장 앞에 삽입
      const history = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        ...previousChats.map((chat) => ({
          role: chat.role,
          parts: [{ text: chat.content }],
        })),
        {
          role: 'user',
          parts: [{ text: content }],
        },
      ];

      // 4. 사용자의 새 메시지 저장
      const userMessage = this.chatRepository.create({
        user_id,
        chat_id,
        role: 'user',
        content,
      });
      await this.chatRepository.save(userMessage);

      // 5. Gemini 응답 생성
      const genAI = new GoogleGenerativeAI(
        this.configService.get('GOOGLE_API_KEY'),
      );
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chatInstance = model.startChat({
        history: history, // <- 위에서 구성한 history 배열
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
          topP: 0.9,
        },
      });

      const result = await chatInstance.sendMessage(content);
      const response = await result.response;
      const answer = response.text();

      // 6. Gemini 응답 저장
      const aiMessage = this.chatRepository.create({
        user_id,
        chat_id,
        role: 'model',
        content: answer,
      });
      await this.chatRepository.save(aiMessage);

      return answer;
    } catch (error) {
      console.error('Chat Error:', error);
      throw new InternalServerErrorException(
        '채팅 처리 중 오류가 발생했습니다.',
      );
    }
  }
}
