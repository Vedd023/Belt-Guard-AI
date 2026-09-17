# Contributing to Belt-Guard AI

Thank you for your interest in contributing to **Belt-Guard AI**! 🎉  
Whether you're fixing a bug, improving documentation, or proposing a new feature — all contributions are welcome.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## How to Contribute

There are many ways to contribute:

- 🐛 **Report bugs** — Open an issue describing the problem
- 💡 **Suggest features** — Open an issue with the `enhancement` label
- 📝 **Improve documentation** — Fix typos, clarify explanations
- 🔧 **Submit pull requests** — Fix bugs or implement new features
- 🧪 **Write tests** — Help improve test coverage

---

## Development Setup

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Git

### Steps

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/<your-username>/Belt-Guard-AI.git
cd Belt-Guard-AI

# 3. Add the upstream remote
git remote add upstream https://github.com/Vedd023/Belt-Guard-AI.git

# 4. Install dependencies
npm install

# 5. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the app.

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, production-ready code |
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation updates |
| `chore/<name>` | Maintenance, dependency updates |

Always branch off from the latest `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/my-new-feature
```

---

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure without feature/fix |
| `perf` | Performance improvement |
| `chore` | Build process / tooling changes |

**Examples:**

```
feat(risk-engine): add configurable fusion weights per conveyor profile
fix(telemetry): correct gaussian noise seed for reproducibility
docs(readme): add hardware integration section
```

---

## Pull Request Process

1. **Ensure your code runs** — `npm run dev` must work without errors
2. **Lint your code** — Run `npm run lint` and fix any issues
3. **Update documentation** — If you changed behaviour, update the README or `docs/`
4. **Keep PRs focused** — One feature or fix per PR
5. **Write a clear description** — Explain *what* changed and *why*
6. **Reference related issues** — Use `Closes #<issue-number>` in your PR description

A maintainer will review your PR within a few days. You may be asked to make changes before it's merged.

---

## Reporting Bugs

Before opening a bug report, please:
- Check that you are on the latest version of `main`
- Search [existing issues](https://github.com/Vedd023/Belt-Guard-AI/issues) to avoid duplicates

When opening a bug, include:
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Browser & OS** you're using
- **Screenshots** if applicable

---

## Suggesting Features

Open an issue with the `enhancement` label and describe:
- **The problem** you're trying to solve
- **Your proposed solution**
- **Alternatives you've considered**

---

*Thank you for making Belt-Guard AI better! 🚀*
