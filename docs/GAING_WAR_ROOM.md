# gAIng War Room Charter

## Purpose
The gAIng War Room is the **single centralized command center** where Ryan dictates instructions **once** and the entire AI crew (Safa, Gemini, Claude, DeepSeek, Perplexity, Comet, Grok, Kimi, Sora) aligns and executes in coordination.

## Problem Solved
Without a War Room, Ryan had to:
- Repeat the same instructions to each AI individually
- Manage context drift as each AI worked in isolation
- Manually reconcile conflicting approaches
- Lose time coordinating instead of building

## Solution: GitHub as the War Room Hub

### Three-Layer Architecture

1. **Shared Brain (Context Layer)**
   - **GitHub Copilot Spaces** bundle repos, issues, notes, and uploaded files into one curated context
   - All agents read from the same canonical source of truth
   - Eliminates context divergence

2. **Shared Task Queue (Coordination Layer)**
   - **GitHub Issues** serve as "Missions"
   - Ryan creates one Issue = entire crew sees the same task
   - Issues track: requirements, definition of done, assignee, progress
   - Labels organize by type: `war-room-foundation`, `agent-pipeline`, `memory-discipline`, `mcp-integration`

3. **Execution Layer (Output Layer)**
   - **GitHub Copilot coding agent** works autonomously on assigned Issues
   - Submits **Pull Requests** for Ryan's review
   - PRs become the audit trail and quality gate
   - Merge = work accepted into Canon

## Operating Rules

### 1. Single Source of Truth
- `/docs/CANON.md` is the definitive reference
- All decisions, constraints, and standards live here
- When in doubt, check Canon first
- Updates to Canon require explicit approval

### 2. Mission Structure
- Every task becomes a GitHub Issue using the Mission template
- Must include:
  - **Objective**: What needs to be done
  - **Definition of Done**: Clear acceptance criteria
  - **Files Affected**: Which files will change
  - **Constraints**: What NOT to do
  - **Assignee**: @copilot or specific agent

### 3. No Rogue Work
- All work must originate from an Issue
- No "I thought it would be better if..." changes
- Stick to the Mission scope
- If you see something that needs changing, create a new Issue

### 4. Communication Protocol
- **Status updates**: Comment on the Issue
- **Questions/blockers**: Comment on the Issue, tag Ryan if urgent
- **Completed work**: Submit PR, link to originating Issue
- **Cross-team coordination**: Use GitHub Discussions for design questions

### 5. PR Review Standards
- Every PR must:
  - Link to its Issue with "Closes #123"
  - Pass automated checks (linting, tests if applicable)
  - Include clear description of changes
  - Be reviewable by humans (no massive PRs)
- Ryan reviews and merges (or requests changes)

## Workflow

### For Ryan:
1. Create Issue with clear Mission template
2. Assign to @copilot or specific agent
3. Review PRs when ready
4. Merge approved work
5. Update Canon if needed

### For AI Agents:
1. Monitor assigned Issues
2. Read Canon and Issue context carefully
3. Execute within Mission scope
4. Submit PR when complete
5. Respond to review feedback
6. Do NOT self-merge

## Naming Conventions

### Issues
- `[WAR-ROOM]` - Infrastructure and foundation work
- `[AGENT]` - Agent execution pipeline improvements
- `[MEMORY]` - Memory and context management
- `[MCP]` - Model Context Protocol integration
- `[INBOX]` - Unsorted ideas to triage later

### Branches
- `feature/short-description`
- `fix/bug-description`
- `docs/documentation-updates`

### PRs
- Title: `[Issue #] Short description of change`
- Example: `[#42] Add Canon document with project standards`

## Success Metrics

✅ Ryan issues **one** instruction → entire crew aligned  
✅ Zero repeated context explanations  
✅ All agents work from same source of truth  
✅ Clear audit trail of who did what and why  
✅ Quality gate through PR reviews  
✅ No divergence or conflicts between agents  

## Future: MCP Integration

Once the GitHub-native workflow is solid, we'll add Model Context Protocol (MCP) servers to enable:
- True cross-agent tool sharing
- Shared data access patterns
- Real-time coordination beyond GitHub

See `/docs/MCP_ROADMAP.md` (coming soon) for details.

## Questions?

If you're an AI agent reading this and something is unclear:
1. Check `/docs/CANON.md`
2. Search existing Issues for precedent
3. Ask in GitHub Discussions
4. Tag Ryan in an Issue comment if urgent

---

**Version**: 1.0  
**Last Updated**: January 4, 2026  
**Owner**: Ryan (megas-DIO)
