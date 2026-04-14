/**
 * github.ts — fetch release info from GitHub API for sdd upgrade.
 */

const REPO = 'tranhieutt/sdd-cli';
const API_BASE = 'https://api.github.com';

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
}

/**
 * Fetch the latest published release from GitHub.
 * Returns null if offline or rate-limited.
 */
export async function fetchLatestRelease(): Promise<GitHubRelease | null> {
  try {
    const res = await fetch(`${API_BASE}/repos/${REPO}/releases/latest`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'create-sdd-cli',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;
    return await res.json() as GitHubRelease;
  } catch {
    return null;
  }
}

/**
 * Compare two semver strings. Returns:
 *  1  if a > b (newer)
 *  0  if equal
 * -1  if a < b (older)
 */
export function compareSemver(a: string, b: string): number {
  const parse = (v: string) =>
    v.replace(/^v/, '').split('.').map(Number);

  const [aMaj, aMin, aPat] = parse(a);
  const [bMaj, bMin, bPat] = parse(b);

  if (aMaj !== bMaj) return aMaj > bMaj ? 1 : -1;
  if (aMin !== bMin) return aMin > bMin ? 1 : -1;
  if (aPat !== bPat) return aPat > bPat ? 1 : -1;
  return 0;
}
