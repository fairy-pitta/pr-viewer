import { GET } from '../route';
import { NextRequest } from 'next/server';
import { dependencyContainer } from '@infrastructure/config/dependencies';
import { GetPRsUseCase } from '@application/use-cases/get-prs/GetPRsUseCase';

// モックを設定
jest.mock('@infrastructure/config/dependencies');
jest.mock('@application/use-cases/get-prs/GetPRsUseCase');

describe('GET /api/prs', () => {
  const mockGetDependencies = dependencyContainer.getDependencies as jest.MockedFunction<
    typeof dependencyContainer.getDependencies
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return PRs when userId is provided', async () => {
    const mockPRs = [
      {
        id: 'pr-1',
        number: 1,
        title: 'Test PR',
        repository: { owner: 'owner', name: 'repo', fullName: 'owner/repo' },
        status: 'open',
      },
    ];

    const mockRepository = {
      findByUser: jest.fn().mockResolvedValue([]),
    };

    const mockUseCase = {
      execute: jest.fn().mockResolvedValue(mockPRs),
    };

    (GetPRsUseCase as jest.MockedClass<typeof GetPRsUseCase>).mockImplementation(() => mockUseCase as any);
    mockGetDependencies.mockReturnValue({
      prRepository: mockRepository as any,
      commentRepository: {} as any,
      reviewRepository: {} as any,
      githubClient: {} as any,
      notificationService: {} as any,
    });

    const request = new NextRequest('http://localhost:3000/api/prs?userId=user123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockPRs);
  });

  it('should return 400 when userId is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/prs');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('userId is required');
  });

  it('should return 500 when error occurs', async () => {
    mockGetDependencies.mockReturnValue({
      prRepository: {
        findByUser: jest.fn().mockRejectedValue(new Error('Database error')),
      } as any,
      commentRepository: {} as any,
      reviewRepository: {} as any,
      githubClient: {} as any,
      notificationService: {} as any,
    });

    const mockUseCase = {
      execute: jest.fn().mockRejectedValue(new Error('Use case error')),
    };

    (GetPRsUseCase as jest.MockedClass<typeof GetPRsUseCase>).mockImplementation(() => mockUseCase as any);

    const request = new NextRequest('http://localhost:3000/api/prs?userId=user123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch PRs');
  });
});
