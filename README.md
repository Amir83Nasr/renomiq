<div align="center">

# 📝 Renomiq

**ابزار تغییر نام دسته‌جمعی فایل‌ها و پوشه‌ها**

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](./package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri)](https://tauri.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)

[English](#english) | [فارسی](#farsi)

</div>

---

<a name="farsi"></a>

<div dir="rtl">

## 🎯 معرفی

**Renomiq** یک اپلیکیشن دسکتاپ برای تغییر نام دسته‌جمعی فایل‌ها و پوشه‌ها است. با استفاده از قوانین قدرتمند، می‌توانید به‌سرعت نام‌های فایل‌های خود را به‌صورت دسته‌ای تغییر دهید.

### ✨ قابلیت‌ها

- 📁 **تغییر نام دسته‌ای** - تغییر نام چندین فایل همزمان
- 🔍 **جستجو و جایگزینی** - یافتن و جایگزینی متن در نام فایل‌ها
- ➕ **پیشوند و پسوند** - افزودن متن قبل یا بعد از نام فایل
- 🔢 **شماره‌گذاری** - افزودن اعداد ترتیبی با عرض قابل تنظیم
- 👁️ **پیش‌نمایش زنده** - مشاهده تغییرات قبل از اعمال
- ⚠️ **شناسایی تداخل** - تشخیص خودکار و جلوگیری از نام‌های تکراری
- 🖱️ **Drag & Drop** - کشیدن و رها کردن مستقیم پوشه روی پنجره
- 🌙 **پشتیبانی از تم** - روشن، تاریک و حالت سیستم
- 🌍 **چندزبانگی** - انگلیسی و فارسی با پشتیبانی کامل RTL
- ⌨️ **میانبرهای صفحه‌کلید** - دسترسی سریع به عملیات پرکاربرد

## 💻 نصب

### پیش‌نیازها

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Rust](https://www.rust-lang.org/tools/install) (برای Tauri)

### مراحل نصب

```bash
#克隆仓库
git clone https://github.com/yourusername/renomiq.git
cd renomiq

# نصب وابستگی‌ها
pnpm install

# اجرای نسخه توسعه
pnpm tauri dev
```

## 🚀 استفاده

1. **انتخاب پوشه**: روی "Browse Folder" کلیک کنید یا پوشه را بکشید
2. **تنظیم قوانین**: جستجو/جایگزینی، پیشوند، پسوند و شماره‌گذاری
3. **مشاهده پیش‌نمایش**: تغییرات را در پنل پیش‌نمایش بررسی کنید
4. **اعمال**: روی "Apply Changes" کلیک کنید

## 🛠️ توسعه

```bash
# توسعه با Tauri (نسخه دسکتاپ)
pnpm tauri:dev

# توسعه وب (بدون Tauri)
pnpm dev

# ساخت نسخه production
pnpm tauri:build

# اجرای تست‌ها
pnpm test

# بررسی فرمت کد
pnpm format:check

# لینت
pnpm lint
```

## 📁 ساختار پروژه

```
renomiq/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout اصلی
│   ├── page.tsx           # صفحه اصلی
│   └── globals.css        # استایل‌های سراسری
├── src/
│   ├── components/        # کامپوننت‌های UI
│   │   ├── ui/           # کامپوننت‌های shadcn/ui
│   │   ├── common/       # کامپوننت‌های مشترک
│   │   └── layout/       # کامپوننت‌های layout
│   ├── features/         # ویژگی‌ها (Feature-based)
│   │   └── renamer/      # بخش تغییر نام
│   ├── lib/              # توابع utility
│   ├── services/         # سرویس‌ها
│   └── types/            # TypeScript types
├── src-tauri/            # کد Rust/Tauri
│   ├── src/
│   └── Cargo.toml
└── public/               # فایل‌های استاتیک
```

## 🧰 تکنولوژی‌ها

- **[Next.js](https://nextjs.org/)** - فریم‌ورک React
- **[Tauri](https://tauri.app/)** - فریم‌ورک دسکتاپ
- **[TypeScript](https://www.typescriptlang.org/)** - تایپ‌اسکریپت
- **[Tailwind CSS](https://tailwindcss.com/)** - استایل‌دهی
- **[shadcn/ui](https://ui.shadcn.com/)** - کامپوننت‌های UI
- **[Vaul](https://vaul.emilkowal.ski/)** - کامپوننت‌های موبایل

## 🤝 مشارکت

مشارکت شما خوشحالمان می‌کند! لطفاً [CONTRIBUTING.md](./CONTRIBUTING.md) را مطالعه کنید.

## 📝 لایسنس

این پروژه تحت لایسنس [MIT](./LICENSE) منتشر شده است.

## 🙏 قدردانی

- فونت [IRAN YEKAN X](https://github.com/OKSAS/iran-yekan-x) برای پشتیبانی فارسی
- [Tauri](https://tauri.app/) برای فریم‌ورک عالی دسکتاپ
- [shadcn/ui](https://ui.shadcn.com/) برای کامپوننت‌های زیبا

</div>

---

<a name="english"></a>

## 🎯 Introduction

**Renomiq** is a desktop application for batch renaming files and folders. Using powerful rules, you can quickly rename your files in bulk.

### ✨ Features

- 📁 **Batch Rename** - Rename multiple files at once
- 🔍 **Search & Replace** - Find and replace text in filenames
- ➕ **Prefix & Suffix** - Add text before or after filenames
- 🔢 **Numbering** - Add sequential numbers with configurable width
- 👁️ **Live Preview** - See changes before applying
- ⚠️ **Conflict Detection** - Automatic detection and prevention of duplicate names
- 🖱️ **Drag & Drop** - Drag folders directly onto the window
- 🌙 **Theme Support** - Light, Dark, and System themes
- 🌍 **Multi-language** - English and Persian with full RTL support
- ⌨️ **Keyboard Shortcuts** - Quick access to common operations

## 💻 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/renomiq.git
cd renomiq

# Install dependencies
pnpm install

# Run development version
pnpm tauri dev
```

## 🚀 Usage

1. **Select Folder**: Click "Browse Folder" or drag a folder
2. **Configure Rules**: Set search/replace, prefix, suffix, and numbering
3. **Preview**: Review changes in the preview panel
4. **Apply**: Click "Apply Changes"

## 🛠️ Development

```bash
# Development with Tauri (desktop version)
pnpm tauri:dev

# Web development (without Tauri)
pnpm dev

# Build production version
pnpm tauri:build

# Run tests
pnpm test

# Check code format
pnpm format:check

# Lint
pnpm lint
```

## 📁 Project Structure

```
renomiq/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Main layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── src/
│   ├── components/        # UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── common/       # Common components
│   │   └── layout/       # Layout components
│   ├── features/         # Features (Feature-based)
│   │   └── renamer/      # Renamer feature
│   ├── lib/              # Utility functions
│   ├── services/         # Services
│   └── types/            # TypeScript types
├── src-tauri/            # Rust/Tauri code
│   ├── src/
│   └── Cargo.toml
└── public/               # Static files
```

## 🧰 Tech Stack

- **[Next.js](https://nextjs.org/)** - React framework
- **[Tauri](https://tauri.app/)** - Desktop framework
- **[TypeScript](https://www.typescriptlang.org/)** - TypeScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[shadcn/ui](https://ui.shadcn.com/)** - UI components
- **[Vaul](https://vaul.emilkowal.ski/)** - Mobile components

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📝 License

This project is licensed under the [MIT License](./LICENSE).

## 🙏 Acknowledgments

- [IRAN YEKAN X](https://github.com/OKSAS/iran-yekan-x) font for Persian support
- [Tauri](https://tauri.app/) for the excellent desktop framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components

---

<div align="center">

Made with ❤️ in Iran

</div>
