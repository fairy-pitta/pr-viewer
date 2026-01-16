// Cloudflare Scheduled Worker - runs every 10 minutes
// This syncs PR data and stores it in KV

interface Env {
  PR_CACHE: KVNamespace;
  GITHUB_ACCESS_TOKEN: string;
}

interface GitHubPR {
  id: string;
  number: number;
  title: string;
  html_url: string;
  state: string;
  draft?: boolean;
  user: { login: string; avatar_url: string };
  head?: { repo?: { owner?: { login: string }; name?: string } };
  assignees?: { login: string }[];
  requested_reviewers?: { login: string }[];
  created_at: string;
  updated_at: string;
}

async function fetchGitHubPRs(token: string, userId: string): Promise<GitHubPR[]> {
  const allPRs: GitHubPR[] = [];
  const seenIds = new Set<string>();

  const queries = [
    `author:${userId}`,
    `review-requested:${userId}`,
    `commenter:${userId}`,
    `reviewed-by:${userId}`,
    `assignee:${userId}`,
  ];

  for (const query of queries) {
    try {
      const url = `https://api.github.com/search/issues?q=type:pr+${query}+state:open&per_page=100`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'pr-viewer-cron',
        },
      });

      if (!response.ok) continue;

      const data = await response.json() as { items: any[] };

      for (const item of data.items) {
        if (!seenIds.has(item.id.toString())) {
          seenIds.add(item.id.toString());
          // Fetch full PR details
          const prUrl = item.pull_request?.url;
          if (prUrl) {
            try {
              const prResponse = await fetch(prUrl, {
                headers: {
                  'Authorization': `token ${token}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'User-Agent': 'pr-viewer-cron',
                },
              });
              if (prResponse.ok) {
                const pr = await prResponse.json() as GitHubPR;
                allPRs.push(pr);
              }
            } catch {
              // Skip failed PR fetches
            }
          }
        }
      }
    } catch {
      // Skip failed queries
    }
  }

  return allPRs;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('Cron job triggered at:', new Date().toISOString());

    if (!env.GITHUB_ACCESS_TOKEN) {
      console.error('GITHUB_ACCESS_TOKEN not configured');
      return;
    }

    try {
      // Get list of users to sync (stored in KV)
      const usersJson = await env.PR_CACHE.get('sync_users');
      const users: string[] = usersJson ? JSON.parse(usersJson) : [];

      for (const userId of users) {
        try {
          console.log(`Syncing PRs for user: ${userId}`);

          const prs = await fetchGitHubPRs(env.GITHUB_ACCESS_TOKEN, userId);

          // Store in KV with 15 minute TTL (slightly longer than cron interval)
          await env.PR_CACHE.put(
            `prs:${userId}`,
            JSON.stringify({
              prs,
              syncedAt: new Date().toISOString(),
            }),
            { expirationTtl: 900 } // 15 minutes
          );

          console.log(`Synced ${prs.length} PRs for ${userId}`);
        } catch (error) {
          console.error(`Failed to sync PRs for ${userId}:`, error);
        }
      }
    } catch (error) {
      console.error('Cron job failed:', error);
    }
  },
};
