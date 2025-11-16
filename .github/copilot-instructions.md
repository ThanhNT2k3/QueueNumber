# Copilot Instructions for Blazor Project

## 🧠 Always read these files:
- docs/requirements.md
- docs/planning.md
- docs/progress.md
- docs/task-learning.md
- docs/architecture.md

## ⚙️ Coding Style
- Use C# 12 and .NET 8 conventions
- Use Dependency Injection for all services
- Blazor components follow structure:
  - @inject
  - @code { }

## 📁 Folder rules
- Pages → /src/Client/Pages
- Components → /src/Client/Components
- Styles → /src/Client/wwwroot/css
- Services → /src/Client/Services or /src/Server/Services
- Models → /src/Shared/Models

## 🧩 When generating code:
- Respect MVVM-like pattern (UI + Service)
- Split logic from UI → place in Services
- For forms → use EditForm + FluentValidation

## 🚀 When continuing work:
- Check progress.md and pick next task from planning.md


## Blazor Project with Copilot Workflow

This project is enhanced with GitHub Copilot Workflow:
- Automated planning
- Smart continuation
- Code generation aligned with architecture


## How to use Copilot
1. Open docs/requirements.md → define scope
2. Add sprint tasks in planning.md
3. Work on tasks → Copilot will suggest next steps
4. Log all progress in progress.md
5. Add technical learnings in task-learning.md

This workflow increases Copilot accuracy 70–90%.
