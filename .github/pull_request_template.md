## Description
Provide a concise explanation of what this pull request changes and why.

## Quality Gates Checklist
Please ensure all items below pass before requesting review:

- [ ] **Cambium Structural Health**: Every modified or added `.ts` and `.tsx` file is $\le 300$ lines.
- [ ] **Security Review**: `pnpm run security:check` passes (zero client secrets, RLS enforced on all tables).
- [ ] **Offline & Sync Gates**: `pnpm run test:offline` passes with all tests green.
- [ ] **TypeScript & Build**: `pnpm run build` succeeds with zero type errors.
- [ ] **Grace Over Streaks**: Copy is non-punitive, free from gamified streaks, and health-neutral.
- [ ] **Accessibility (WCAG 2.2 AA)**: Contrast targets, keyboard navigation, and touch targets preserved.

## Related Issues
Closes #
