# Coding Standards

- All code must include doc comments on public APIs
- Every system must have a corresponding architecture decision record in `docs/architecture/`
- Configuration values must be data-driven (external config files), never hardcoded
- Secrets and environment variables follow the standards in `.claude/rules/secrets-config.md`
- All public methods must be unit-testable (dependency injection over singletons)
- Commits must reference the relevant design document or task ID
- **Verification-driven development**: Write tests first when adding new features or systems.
  For UI changes, verify with screenshots. Compare expected output to actual output
  before marking work complete. Every implementation should have a way to prove it works.
- **Defensive external API calls**: Every call to an external service (Google APIs, Stripe,
  third-party SDKs) MUST be wrapped in `try/catch` with a meaningful fallback or retry.
  Never assume external APIs will return the expected shape.
  *(Source: Crawler Lesson #9 — `getRows()` throws if sheet has no header)*
- **ESM/CJS compatibility check**: Before adding any npm dependency, verify its module
  system matches the project (`require()` = CJS, `import` = ESM). Check the package's
  `"type"` field and its transitive dependencies. Pin exact versions for core libraries.
  *(Source: Crawler Lesson #3 — google-spreadsheet v5 broke CJS projects)*
- **Scraping performance**: When using Puppeteer/Playwright for web scraping, enable
  request interception to block `image`, `stylesheet`, `font`, `media` resources.
  This reduces bandwidth by 60-80% and speeds up page load significantly.
  *(Source: Crawler Lesson #10)*

# Design Document Standards

- All design docs use Markdown
- Each feature or system has a dedicated spec in `design/specs/`
- Documents must include these 8 required sections:
  1. **Overview** -- one-paragraph summary
  2. **User Value** -- intended user benefit and experience
  3. **Detailed Requirements** -- unambiguous functional requirements
  4. **Formulas / Algorithms** -- all math or logic defined with variables
  5. **Edge Cases** -- unusual situations handled
  6. **Dependencies** -- other systems listed
  7. **Configuration Parameters** -- configurable values with safe ranges identified
  8. **Acceptance Criteria** -- testable success conditions
- All configurable values must link to their source rationale
