# Contributing to Swarm Command 🐝

Thank you for your interest in contributing to Swarm Command! This project is a Copilot CLI skill — no runtime code, just markdown prompt engineering and documentation.

## How to Contribute

### Reporting Issues

- Use [GitHub Issues](https://github.com/DUBSOpenHub/swarm-command/issues) to report bugs or suggest improvements
- For security vulnerabilities, see [SECURITY.md](SECURITY.md)

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes
4. Verify the checklist below
5. Submit a pull request

### PR Checklist

Before opening a PR, ensure:

- [ ] All templates have complete DEPTH LOCK blocks for leaf agents
- [ ] `catalog.yml` references are valid
- [ ] YAML parses cleanly (`config.yml`, `catalog.yml`)
- [ ] Depth Guard audit checklist passes (see `protocols/depth-guard.md`)
- [ ] All JSON schemas in `protocols/context-capsule.md` are valid draft-07
- [ ] Both SKILL.md copies are identical:
  - `skills/swarm-command/SKILL.md`
  - `.github/skills/swarm-command/SKILL.md`
- [ ] Agent counts match across all files (SS-50: ~52, SS-100: ~89, SS-250: ~316)
- [ ] Shadow scoring references use Shadow Score Spec format (no separate shadow validator agents)

## Non-Negotiables

1. **Depth Guard is sacred** — Workers are ALWAYS leaf nodes (`explore`/`task`). They MUST NOT use the `task` tool.
2. **Config is the source of truth** — Never hardcode model names, thresholds, or tunables inside prompts.
3. **All outputs are strict JSON** — Every layer boundary uses schema-validated JSON.
4. **Just a skill** — Do not add runtime code, package managers, telemetry, or dashboards.
5. **Shadow scoring is Nexus-internal** — No separate shadow validator agents. Implements [Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec) L2.

## Project Structure

See the [README](README.md#-repository-structure) for a full file map.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
