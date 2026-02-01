# راهنمای مشارکت در Renomiq

از اینکه در توسعه Renomiq مشارکت می‌کنید سپاسگزاریم! 🎉

---

## 🎯 قرارداد کامیت (Conventional Commits)

ما از [Conventional Commits](https://www.conventionalcommits.org/) استفاده می‌کنیم. این روش باعث می‌شود تاریخچه تغییرات خوانا و خودکارسازی‌هایی مثل تولید نسخه (semver) و changelog امکان‌پذیر شود.

### ساختار کامیت

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### انواع کامیت (Types)

| نوع        | معنی                           | مثال                                                 |
| ---------- | ------------------------------ | ---------------------------------------------------- |
| `feat`     | اضافه کردن ویژگی جدید          | `feat(renamer): add regex support for search`        |
| `fix`      | رفع باگ                        | `fix(ui): resolve RTL layout issue in dark mode`     |
| `docs`     | تغییر در مستندات               | `docs(readme): update installation instructions`     |
| `style`    | تغییرات ظاهری کد (فاصله، فرمت) | `style: format with prettier`                        |
| `refactor` | بازنویسی کد بدون تغییر عملکرد  | `refactor(hooks): simplify useFileRename logic`      |
| `perf`     | بهبود عملکرد                   | `perf(list): virtualize large file lists`            |
| `test`     | اضافه/تغییر تست                | `test(utils): add tests for persian-numbers`         |
| `chore`    | کارهای جانبی (deps, build, ci) | `chore(deps): update tauri to v2`                    |
| `ci`       | تغییر در CI/CD                 | `ci(github): add automated release workflow`         |
| `build`    | تغییر در سیستم build           | `build: update next.config for static export`        |
| `revert`   | بازگردانی کامیت قبلی           | `revert: feat(renamer): remove broken regex feature` |

### اسکوپ (Scope) - اختیاری

اسکوپ نشان‌دهنده بخش پروژه است:

- `ui` - کامپوننت‌های UI
- `renamer` - بخش تغییر نام فایل
- `i18n` - ترجمه و چندزبانگی
- `theme` - تم و ظاهر
- `tauri` - بخش Rust/Tauri
- `deps` - وابستگی‌ها
- `config` - فایل‌های پیکربندی

### توضیحات (Description)

- از حال امری (imperative mood) استفاده کنید: "add" نه "added" یا "adds"
- حرف اول کوچک
- بدون نقطه در انتها
- حداکثر 72 کاراکتر در خط اول

### مثال‌های کامل

```bash
# ویژگی جدید
feat(renamer): add batch folder renaming support

# رفع باگ
fix(ui): prevent overflow in long filename display

# بهبود عملکرد
perf(virtual-list): reduce re-renders on large file sets

# تغییرات build
chore(tauri): update dependencies to latest stable

# با body و footer
feat(i18n): add german language support

- Add de.ts locale file
- Update language selector component
- Add RTL detection logic

Closes #123
```

---

## 🌿 شاخه‌ها (Branching)

```
main
  └── develop
       ├── feat/feature-name
       ├── fix/bug-description
       ├── docs/update-readme
       └── refactor/component-name
```

### نام‌گذاری شاخه‌ها

- `feat/short-description` - ویژگی جدید
- `fix/issue-description` - رفع باگ
- `docs/what-changed` - مستندات
- `refactor/what-changed` - بازنویسی
- `hotfix/critical-fix` - رفع فوری در production

---

## 🔄 فرآیند Pull Request

1. **شاخه جدید** از `develop` بسازید
2. **کامیت‌ها** را با قرارداد بالا انجام دهید
3. **تست‌ها** باید پاس شوند: `pnpm test`
4. **لینت** باید بدون خطا باشد: `pnpm lint`
5. **فرمت** کد را بررسی کنید: `pnpm format:check`
6. **PR** به سمت `develop` بزنید

### قالب Pull Request

```markdown
## توضیحات

شرح کوتاه تغییرات

## تغییرات

- [ ] تست نوشته شده
- [ ] مستندات بروزرسانی شده
- [ ] تغییرات breaking ثبت شده

## اسکرین‌شات (در صورت تغییر UI)

## لینک‌های مرتبط

Closes #issue-number
```

---

## 🧪 تست‌نویسی

```bash
# اجرای همه تست‌ها
pnpm test

# اجرا در حالت watch
pnpm test -- --watch

# coverage
pnpm test -- --coverage
```

### اصول تست‌نویسی

- Unit tests برای `src/lib/utils/`
- Integration tests برای `src/features/`
- Naming: `*.test.ts` یا `*.spec.ts`

---

## 🎨 استانداردهای کد

### TypeScript

- همیشه `strict` mode
- explicit return types برای توابع public
- استفاده از `interface` برای objects، `type` برای unions

### React

- Functional components with hooks
- Custom hooks برای منطق reusable
- Props destructuring در پارامترها

### Naming

- Components: PascalCase (`FileList.tsx`)
- Hooks: camelCase with `use` prefix (`useFileRename`)
- Utils: camelCase (`formatFileSize`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

---

## 🐛 گزارش Issue

### باگ

```markdown
**توضیح**
شرح مختصر باگ

**مراحل تولید**

1. باز کردن برنامه
2. drag فولدر شامل...
3. کلیک روی...

**رفتار مورد انتظار**
چه اتفاقی باید بیفتد

**محیط**

- OS: macOS 14 / Windows 11
- Version: 0.2.0
```

### ویژگی جدید

```markdown
**مشکل**
چه مشکلی حل می‌شود

**راه‌حل پیشنهادی**
توضیح ویژگی

**Alternative‌ها**
راه‌حل‌های جایگزین
```

---

## 📋 چک‌لیست قبل از کامیت

- [ ] کد کامپایل می‌شود (`pnpm build`)
- [ ] تست‌ها پاس می‌شوند (`pnpm test`)
- [ ] لینت بدون خطاست (`pnpm lint`)
- [ ] فرمت درست است (`pnpm format:check`)
- [ ] پیام کامیت طبق قرارداد است
- [ ] تغییرات مربوط به هم در یک کامیت نیستند

---

## 💬 سوالات؟

- Issue بسازید با label `question`
- یا در Discussions سوال بپرسید

---

با تشکر از مشارکت شما! 🙏
