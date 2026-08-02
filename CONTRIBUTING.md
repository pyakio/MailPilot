# Contributing to MailPilot 🤝

Thank you for your interest in contributing to **MailPilot**! We welcome contributions from developers of all skill levels. To ensure a smooth development workflow, please adhere to the guidelines below.

---

## 📐 Coding Standards & Guidelines

1. **Functional Components & React Hooks**:
   - Write modern React functional components using Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
   - Use standard React naming conventions (`PascalCase` for components, `camelCase` for variables/functions, `useHookName` for custom hooks).

2. **Styling & UI**:
   - Use Tailwind CSS v4 utility classes.
   - Do NOT use inline CSS styles (`style={{ ... }}`) unless dynamic mathematical positions (e.g., SVG coordinates) require it.
   - Maintain dark/light mode compatibility by referencing `dark:` variant classes on containers and text.

3. **Code Formatting & Clean Code**:
   - Keep files modular and focused on a single responsibility.
   - Remove unused imports, dead variables, and redundant comments prior to submitting code.
   - Follow ESLint and Prettier formatting standards.

---

## 🌿 Git Branch Naming Conventions

Create feature branches off the `main` branch using the following prefix format:

| Branch Type | Prefix Pattern | Example |
| :--- | :--- | :--- |
| **Feature** | `feature/short-description` | `feature/jwt-authentication` |
| **Bug Fix** | `fix/short-description` | `fix/csv-parser-delimiter` |
| **Refactor** | `refactor/short-description` | `refactor/toast-context` |
| **Documentation** | `docs/short-description` | `docs/update-readme-setup` |

---

## 💬 Conventional Commit Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>
```

### Supported Types:
- `feat`: A new user-facing feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semi-colons, white-space changes (no code logic change)
- `refactor`: Code restructuring without changing external behavior
- `perf`: Performance optimization changes
- `test`: Adding or correcting tests
- `chore`: Maintenance tasks, dependencies updates

### Example Commit Messages:
```bash
git commit -m "feat(campaigns): add date picker to schedule broadcast"
git commit -m "fix(contacts): resolve CSV parser comma splitting error"
git commit -m "docs(readme): update environment setup instructions"
```

---

## 📁 Repository Folder Conventions

```
src/
├── components/
│   ├── ui/        # Reusable UI primitives (Buttons, Modals, Badges)
│   ├── layout/    # Navigation, Navbar, Header, Sidebar
│   ├── charts/    # Data visualization components
│   ├── forms/     # Input forms & interactive dialogs
│   └── tables/    # Data grids and tabular listings
├── context/       # React Context providers (Theme, Toast, Auth)
├── hooks/         # Custom React hooks (useTheme, useToast)
├── pages/         # Top-level route pages (Dashboard, Campaigns, etc.)
├── routes/        # App routing definitions
├── services/      # Axios HTTP API services
└── utils/         # Pure formatting helpers
```

---

## 📋 Pull Request (PR) Checklist

Before submitting a Pull Request:

- [ ] Code builds cleanly without errors (`npm run build`).
- [ ] No console errors or unresolved ESLint warnings.
- [ ] Added/updated relevant documentation if code changes public interfaces.
- [ ] Verified dark mode and mobile responsiveness across screens.
- [ ] Git commit messages follow Conventional Commits format.
