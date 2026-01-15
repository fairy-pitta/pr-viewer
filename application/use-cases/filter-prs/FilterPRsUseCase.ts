// application/use-cases/filter-prs/FilterPRsUseCase.ts
import type { PRRepository } from '@domain/repositories/PRRepository';
import { PRMapper } from '@application/mappers/PRMapper';
import type { PRDTO } from '@application/dto/PRDTO';
import { FilterPRsQuery } from './FilterPRsQuery';

export class FilterPRsUseCase {
  constructor(private prRepository: PRRepository) {}

  async execute(query: FilterPRsQuery): Promise<PRDTO[]> {
    let prs = await this.prRepository.findByUser(query.userId);

    // リポジトリでフィルタリング
    if (query.repository) {
      prs = prs.filter(pr => pr.repository.equals(query.repository!));
    }

    // 状態でフィルタリング
    if (query.status) {
      prs = prs.filter(pr => pr.status.equals(query.status!));
    }

    // 担当者でフィルタリング
    if (query.assignee) {
      prs = prs.filter(pr => pr.assignees.includes(query.assignee!));
    }

    // 日付範囲でフィルタリング
    if (query.dateRange) {
      prs = prs.filter(pr => {
        const updatedAt = pr.updatedAt;
        return updatedAt >= query.dateRange!.from && updatedAt <= query.dateRange!.to;
      });
    }

    // 検索でフィルタリング
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      prs = prs.filter(pr => {
        return (
          pr.title.toString().toLowerCase().includes(searchLower) ||
          pr.repository.toString().toLowerCase().includes(searchLower) ||
          pr.author.login.toLowerCase().includes(searchLower)
        );
      });
    }

    return PRMapper.toDTOs(prs);
  }
}
