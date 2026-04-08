# 🔒 Security Policy

## 🛡️ Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes     |

## 🚨 Reporting a Vulnerability

We take security seriously! 🐝 If you discover a security vulnerability in this project, **please report it responsibly**.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Instead, email us at: **security@dubsopenhub.com**
3. Or use [GitHub's private vulnerability reporting](https://github.com/DUBSOpenHub/swarm-command/security/advisories/new)

### What to Include

Please provide as much of the following as possible:

- 📝 Description of the vulnerability
- 🔄 Steps to reproduce
- 💥 Potential impact
- 💡 Suggested fix (if you have one)

### What to Expect

- ⏱️ **Acknowledgment** within 48 hours
- 🔍 **Assessment** within 1 week
- 🛠️ **Fix or mitigation** as quickly as possible
- 🎉 **Credit** in the release notes (unless you prefer anonymity)

## 🔐 Security Features

This repository has the following GitHub security features configured:

| Feature | Status | Notes |
|---------|--------|-------|
| ✅ Dependabot Alerts | Enabled | Monitors dependencies for known vulnerabilities |
| ✅ Dependabot Security Updates | Enabled | Auto-creates PRs to fix vulnerable dependencies |
| ✅ Secret Scanning | Enabled | Detects accidentally committed secrets |
| ✅ Secret Scanning Push Protection | Enabled | Blocks pushes containing secrets |
| ✅ Code Scanning (CodeQL) | Available | Static analysis for security bugs |

## 📋 Best Practices

Since this is a Copilot CLI skill (no runtime code, only markdown instructions), the primary security considerations are:

- 🔑 **No secrets in skill files** — SKILL.md and agent.md should never contain API keys, tokens, or credentials
- 📜 **Safe instructions** — Skill instructions should never instruct the agent to bypass security controls
- 🔍 **Dependency awareness** — If dependencies are added in the future, keep them updated

## 🛡️ Prompt Injection Mitigation

Since this skill orchestrates hundreds of AI agents and processes user-provided task descriptions, prompt injection is a relevant concern:

- 🔒 **Depth Guard** — 3-layer enforcement prevents runaway spawning: prompt-level, contract-level, and config-level
- 🧹 **Input sanitization** — Task descriptions are compressed through 4 layers of context reduction (128K → 128 tokens), stripping potential injection payloads
- 🚫 **No credential passthrough** — User input is used as task descriptions only; it is never interpolated into system-level commands or used to access external services
- ⚖️ **Consensus scoring** — Even if one agent is influenced by injected content, the median-of-3 consensus mechanism and cross-family review limits the impact on final scores
- 👻 **Shadow scoring** — Hidden criteria that agents never see provide an independent quality audit, catching outputs that look good but contain errors

## 📄 License

This project is licensed under the [MIT License](LICENSE).
