// application/dto/CommentDTO.ts

export interface CommentDTO {
  id: string;
  author: {
    login: string;
    type: 'User' | 'Bot';
    avatarUrl?: string;
  };
  content: string;
  source: string;
  createdAt: string;
  isResolved: boolean;
  url?: string;
}
