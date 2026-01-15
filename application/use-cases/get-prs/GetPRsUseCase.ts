// application/use-cases/get-prs/GetPRsUseCase.ts
import type { PRRepository } from '@domain/repositories/PRRepository';
import { PRMapper } from '@application/mappers/PRMapper';
import type { PRDTO } from '@application/dto/PRDTO';
import { GetPRsQuery } from './GetPRsQuery';

export class GetPRsUseCase {
  constructor(private prRepository: PRRepository) {}

  async execute(query: GetPRsQuery): Promise<PRDTO[]> {
    const prs = await this.prRepository.findByUser(query.userId);
    return PRMapper.toDTOs(prs);
  }
}
