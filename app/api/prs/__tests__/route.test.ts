// next/serverをモック
jest.mock('next/server', () => {
  class MockNextRequest {
    constructor(public url: string) {}
    get nextUrl() {
      return {
        searchParams: new URL(this.url).searchParams,
      };
    }
  }

  class MockNextResponse {
    static json(data: any, init?: any) {
      return {
        json: async () => data,
        status: init?.status || 200,
      };
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  };
});

import { dependencyContainer } from '@infrastructure/config/dependencies';
import { GetPRsUseCase } from '@application/use-cases/get-prs/GetPRsUseCase';
import { GET } from '../route';

// NextRequestのモック
class MockNextRequest {
  constructor(public url: string) {}
  get nextUrl() {
    return {
      searchParams: new URL(this.url).searchParams,
    };
  }
}

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

    const request = new MockNextRequest('http://localhost:3000/api/prs?userId=user123') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockPRs);
  });

  it('should return 400 when userId is missing', async () => {
    const request = new MockNextRequest('http://localhost:3000/api/prs') as any;
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

    const request = new MockNextRequest('http://localhost:3000/api/prs?userId=user123') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch PRs');
  });
});
