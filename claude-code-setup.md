# Claude Code Setup - Full Configuration

**Date:** 2026-04-06
**Model:** Claude Opus 4.6 (1M context)
**Effort Level:** max
**Platform:** Windows 11 Pro, bash shell

---

## MCP Servers (7)

| Server | Type | Command / URL | Purpose |
|--------|------|---------------|---------|
| **context7** | stdio | `npx -y @upstash/context7-mcp` | Library/framework documentation lookup |
| **playwright** | stdio | `npx @playwright/mcp@latest --headless` | Browser automation, screenshots, UI testing |
| **chrome-devtools** | stdio | `npx @anthropic-ai/chrome-devtools-mcp@latest` | Chrome DevTools integration |
| **sequential-thinking** | stdio | `npx -y @modelcontextprotocol/server-sequential-thinking` | Multi-step reasoning |
| **memory** | stdio | `npx -y @modelcontextprotocol/server-memory` | Knowledge graph memory |
| **sentry** | http | `https://mcp.sentry.dev/mcp` | Error monitoring |
| **github** | http | `https://api.githubcopilot.com/mcp` | GitHub Copilot MCP (authenticated) |
| **lottiefiles** | stdio | `npx -y mcp-server-lottiefiles` | Lottie animation search/details |

### Cloud MCP (claude.ai integrated)
| Server | Auth User |
|--------|-----------|
| **Hugging Face** | `dudochnikhuli` |
| **Gmail** | available (auth required) |
| **Google Calendar** | available (auth required) |
| **Sentry** | available (auth required) |

---

## Hooks

### PostToolUse
| Matcher | Action | Timeout |
|---------|--------|---------|
| `Write(*.py)` | Auto-format with `ruff` | 15s |

### PreToolUse
| Matcher | Action |
|---------|--------|
| `Bash` | Block `pip`/`pip3` (use `uv`), block `rm -rf /` |

---

## Agents (31)

| Agent | Purpose |
|-------|---------|
| **architect** | System design, architectural decisions |
| **build-error-resolver** | Fix build/type errors |
| **chief-of-staff** | Communication triage (email, Slack, LINE, Messenger) |
| **code-reviewer** | Code quality, patterns, best practices |
| **cpp-build-resolver** | C++ build/CMake error resolution |
| **cpp-reviewer** | C++ memory safety, modern idioms |
| **database-reviewer** | PostgreSQL optimization, schema design |
| **doc-updater** | Documentation and codemap updates |
| **docs-lookup** | Library docs via Context7 |
| **e2e-runner** | E2E testing with Playwright |
| **flutter-reviewer** | Flutter/Dart code review |
| **go-build-resolver** | Go build error resolution |
| **go-reviewer** | Idiomatic Go review |
| **harness-optimizer** | Agent harness config optimization |
| **healthcare-reviewer** | Clinical safety, PHI compliance |
| **java-build-resolver** | Java/Maven/Gradle build fixes |
| **java-reviewer** | Java/Spring Boot review |
| **kotlin-build-resolver** | Kotlin/Gradle build fixes |
| **kotlin-reviewer** | Kotlin/Android/KMP review |
| **loop-operator** | Autonomous agent loop monitoring |
| **performance-optimizer** | Bottleneck analysis, optimization |
| **planner** | Implementation planning |
| **python-reviewer** | PEP 8, type hints, Pythonic idioms |
| **pytorch-build-resolver** | PyTorch/CUDA error resolution |
| **refactor-cleaner** | Dead code cleanup |
| **rust-build-resolver** | Rust/Cargo build fixes |
| **rust-reviewer** | Ownership, lifetimes, unsafe review |
| **security-reviewer** | OWASP Top 10, vulnerability detection |
| **tdd-guide** | Test-driven development enforcement |
| **typescript-reviewer** | TypeScript/JS type safety, async |

---

## Skills (~180+)

### Core Workflow
| Skill | Trigger |
|-------|---------|
| `/plan` | Implementation planning before coding |
| `/tdd` | Test-driven development workflow |
| `/review` | Review current git changes |
| `/code-review` | Full code review |
| `/verify` | Verification loop |
| `/build-fix` | Build and fix errors |
| `/test` | TDD workflow |
| `/test-coverage` | Test coverage check |
| `/refactor-clean` | Dead code cleanup |
| `/simplify` | Review changed code for reuse/quality |
| `/commit` | (built-in) |

### Documentation & Research
| Skill | Trigger |
|-------|---------|
| `/docs` | Library docs via Context7 |
| `/deep-research` | Multi-source research with citations |
| `/exa-search` | Neural search via Exa |
| `/update-docs` | Update documentation |
| `/update-codemaps` | Update codemaps |

### Architecture & Planning
| Skill | Trigger |
|-------|---------|
| `/blueprint` | Multi-session construction plan |
| `/product-lens` | Validate "why" before building |
| `/architecture-decision-records` | Capture arch decisions as ADRs |

### Multi-Agent Orchestration
| Skill | Trigger |
|-------|---------|
| `/orchestrate` | Sequential/tmux/worktree orchestration |
| `/devfleet` | Parallel Claude Code agents |
| `/team-builder` | Interactive agent picker |
| `/loop` | Recurring interval tasks |
| `/loop-start` / `/loop-status` | Loop management |

### Design & Frontend
| Skill | Trigger |
|-------|---------|
| `/frontend-design` | Distinctive frontend interfaces |
| `/interface-design` | Dashboards, admin panels, apps |
| `/design-system` | Design system audit |
| `/frontend-slides` | HTML presentations |
| `/browser-qa` | Visual testing via browser |
| `/liquid-glass-design` | iOS 26 Liquid Glass system |

### Security & Quality
| Skill | Trigger |
|-------|---------|
| `/security-review` | Security checklist and patterns |
| `/security-scan` | Scan .claude/ for vulnerabilities |
| `/safety-guard` | Prevent destructive operations |
| `/quality-gate` | Quality gate check |

### Language-Specific
| Skill | Trigger |
|-------|---------|
| `/python-review`, `/python-patterns`, `/python-testing` | Python |
| `/golang-patterns`, `/golang-testing`, `/go-review`, `/go-build` | Go |
| `/rust-patterns`, `/rust-testing`, `/rust-review`, `/rust-build` | Rust |
| `/cpp-coding-standards`, `/cpp-testing`, `/cpp-review`, `/cpp-build` | C++ |
| `/kotlin-patterns`, `/kotlin-testing`, `/kotlin-review`, `/kotlin-build` | Kotlin |
| `/java-coding-standards`, `/springboot-*` | Java/Spring |
| `/swift-*`, `/swiftui-patterns` | Swift |
| `/flutter-dart-code-review`, `/flutter-reviewer` | Flutter |
| `/laravel-*` | Laravel/PHP |
| `/django-*` | Django/Python |
| `/perl-*` | Perl |

### Framework-Specific
| Skill | Trigger |
|-------|---------|
| `/nextjs-turbopack` | Next.js 16+ / Turbopack |
| `/nuxt4-patterns` | Nuxt 4 |
| `/mcp-server-patterns` | Build MCP servers |
| `/docker-patterns` | Docker/Compose |
| `/postgres-patterns` | PostgreSQL |
| `/clickhouse-io` | ClickHouse |
| `/database-migrations` | DB migrations |

### Content & Media
| Skill | Trigger |
|-------|---------|
| `/article-writing` | Long-form content |
| `/content-engine` | Platform-native content |
| `/crosspost` | Multi-platform distribution |
| `/x-api` | X/Twitter API |
| `/video-editing` | Video editing workflows |
| `/fal-ai-media` | Image/video/audio generation |
| `/videodb` | Video/audio processing |

### Meta / Claude Code Config
| Skill | Trigger |
|-------|---------|
| `/configure-ecc` | Install ECC skills/rules |
| `/context-budget` | Audit context window usage |
| `/prompt-optimize` | Optimize prompts |
| `/skill-create` | Generate skills from git history |
| `/rules-distill` | Extract rules from skills |
| `/harness-audit` | Audit harness config |
| `/claw` | NanoClaw REPL |
| `/save-session` / `/resume-session` | Session persistence |
| `/schedule` | Scheduled remote agents |

### AI/ML
| Skill | Trigger |
|-------|---------|
| `/pytorch-patterns` | PyTorch deep learning |
| `/claude-api` | Anthropic Claude API patterns |
| `/cost-aware-llm-pipeline` | LLM API cost optimization |

### Business/Industry
| Skill | Trigger |
|-------|---------|
| `/investor-materials`, `/investor-outreach` | Fundraising |
| `/market-research` | Market/competitive analysis |
| `/healthcare-*` | Healthcare/EMR/CDSS/PHI |
| `/carrier-relationship-management` | Logistics carriers |
| `/logistics-exception-management` | Freight exceptions |
| `/inventory-demand-planning` | Demand forecasting |
| `/energy-procurement` | Energy procurement |
| `/customs-trade-compliance` | Trade compliance |
| `/production-scheduling` | Manufacturing scheduling |
| `/quality-nonconformance` | Quality control |
| `/returns-reverse-logistics` | Returns management |

---

## Built-in Tools

| Tool | Purpose |
|------|---------|
| **Read** | Read files (text, images, PDFs, notebooks) |
| **Write** | Create/overwrite files |
| **Edit** | Surgical string replacements |
| **Bash** | Shell command execution |
| **Glob** | File pattern matching |
| **Grep** | Content search (ripgrep) |
| **Agent** | Launch specialized subagents |
| **Skill** | Invoke slash commands |
| **TodoWrite** | Task tracking |
| **WebFetch** | Fetch web pages |
| **WebSearch** | Web search |
| **NotebookEdit** | Jupyter notebook editing |
| **EnterPlanMode** / **ExitPlanMode** | Plan mode |
| **CronCreate** / **CronList** / **CronDelete** | Scheduled tasks |

---

## Rules (loaded globally)

### Common Rules (`~/.claude/rules/common/`)
- `coding-style.md` - Immutability, file organization, error handling
- `git-workflow.md` - Conventional commits, PR workflow
- `testing.md` - 80% coverage, TDD mandatory
- `performance.md` - Model selection, context management
- `patterns.md` - Skeleton projects, repository pattern, API format
- `hooks.md` - Hook types, TodoWrite best practices
- `agents.md` - Agent orchestration, parallel execution
- `security.md` - Mandatory security checks, secret management
- `code-review.md` - Review triggers, checklist, severity levels
- `development-workflow.md` - Research -> Plan -> TDD -> Review -> Commit

### Chinese Translations (`~/.claude/rules/zh/`)
- Full mirror of common rules in Chinese

### Language-Specific Rules
| Directory | Languages |
|-----------|-----------|
| `typescript/` | TypeScript/JavaScript |
| `python/` | Python |
| `golang/` | Go |
| `rust/` | Rust |
| `cpp/` | C++ |
| `java/` | Java |
| `kotlin/` | Kotlin |
| `swift/` | Swift |
| `php/` | PHP |
| `perl/` | Perl |
| `csharp/` | C# |

### Special Rules
- `node.md` - ECC codebase Node.js conventions
- `everything-claude-code-guardrails.md` - ECC meta guardrails

---

## Project-Level Config (Babaevskaya)

- **CLAUDE.md** -> references `AGENTS.md`
- **AGENTS.md** -> Next.js breaking changes warning: read `node_modules/next/dist/docs/` before coding

---

## Global CLAUDE.md Highlights

- **Auto design mode**: Frontend tasks trigger aesthetic design thinking + Playwright verification
- **Python**: Type hints required, `uv` only (no pip), ruff formatting via hook
- **Architecture**: Router -> Service -> Repository layers
- **Testing**: pytest + TDD, 80%+ coverage, mock boundaries not logic
- **Workflow**: Context7 for docs, Sequential Thinking for multi-step decisions
