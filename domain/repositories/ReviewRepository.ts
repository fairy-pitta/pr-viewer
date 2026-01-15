// domain/repositories/ReviewRepository.ts
import { Review } from '../entities/Review';
import { PRId } from '../value-objects/PRId';

export interface ReviewRepository {
  findByPR(prId: PRId): Promise<Review[]>;
  save(prId: PRId, review: Review): Promise<void>;
  saveMany(prId: PRId, reviews: Review[]): Promise<void>;
}
