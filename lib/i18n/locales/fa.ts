export default {
  // Common terms
  common: {
    app_title: 'رینامیک - تغییر نام فایل',
    choose_folder: 'انتخاب پوشه',
    change_folder: 'تغییر پوشه',
    apply_rename: 'اعمال تغییر نام',
    cancel: 'انصراف',
    ok: 'تأیید',
    yes: 'بله',
    no: 'خیر',
    close: 'بستن',
    save: 'ذخیره',
    delete: 'حذف',
    edit: 'ویرایش',
    add: 'افزودن',
    search: 'جستجو',
    replace: 'جایگزینی',
    prefix: 'پیشوند',
    suffix: 'پسوند',
    numbering: 'شماره‌گذاری',
    number_width: 'تعداد رقم',
    preview: 'پیش‌نمایش',
    settings: 'تنظیمات',
    theme: 'زمینه',
    language: 'زبان',
    light: 'روشن',
    dark: 'تاریک',
    system: 'سیستم',
    english: 'English',
    persian: 'فارسی',
  },

  // Page specific
  home: {
    title: 'رینامیک',
    subtitle: 'ابزار تغییر نام دسته‌جمعی فایل‌ها',
    active_folder: 'پوشه فعال:',
    no_changes_to_apply: 'تغییری برای اعمال وجود ندارد',
    rename_failed: 'تغییر نام با خطا مواجه شد',
    rename_success: 'فایل‌ها با موفقیت تغییر نام یافتند',
  },

  // Components
  file_selector: {
    desktop_only_message:
      'انتخاب پوشه فقط در نرم‌افزار دسکتاپ در دسترس است. لطفاً با دستور `pnpm tauri dev` برنامه را اجرا کنید',
  },

  rule_editor: {
    title: 'قوانین تغییر نام',
    search_replace: 'جستجو و جایگزینی',
    search_placeholder: 'متن مورد نظر...',
    replace_placeholder: 'متن جایگزین...',
    prefix: 'پیشوند',
    suffix: 'پسوند',
    prefix_placeholder: 'مثال: IMG_',
    suffix_placeholder: 'مثال: _v1',
    numbering: 'شماره‌گذاری',
    numbering_checkbox: 'افزودن شماره ترتیبی به انتهای نام',
    number_width: 'تعداد ارقام',
    number_width_label: 'تعداد ارقام',
    digit_1: '۱ رقم (۱، ۲، ۳)',
    digit_2: '۲ رقم (۰۱، ۰۲، ۰۳)',
    digit_3: '۳ رقم (۰۰۱، ۰۰۲، ۰۰۳)',
    digit_4: '۴ رقم (۰۰۰۱، ۰۰۰۲، ۰۰۰۳)',
    files_loaded: 'فایل بارگذاری شد',
    conflicts_skipped: 'تداخل‌ها و فایل‌های بدون تغییر به‌طور خودکار رد می‌شوند',
    apply_changes: 'اعمال تغییرات',
    apply_rename_button: 'اعمال تغییر نام',
  },

  preview_panel: {
    title: 'پیش‌نمایش تغییرات',
    number: 'ردیف',
    current_name: 'نام فعلی',
    new_name: 'نام جدید',
    status: 'وضعیت',
    status_conflict: 'تداخل',
    status_unchanged: 'بدون تغییر',
    status_ok: 'تأیید',
    empty_message: 'پوشه‌ای را انتخاب کنید تا فایل‌ها و پیش‌نمایش را ببینید',
    original: 'نام اصلی',
    renamed: 'نام جدید',
    no_preview_available: 'پیش‌نمایشی موجود نیست',
    conflicts_detected: 'تداخل در نام‌ها شناسایی شد',
  },

  // Errors
  errors: {
    failed_to_load_folder: 'خطا در بارگذاری پوشه',
    failed_to_apply_rename: 'خطا در اعمال تغییر نام',
    no_changes_to_apply: 'تغییری برای اعمال وجود ندارد',
  },

  // DropZone
  dropzone: {
    title: 'فایل‌ها را اینجا رها کنید',
    subtitle: 'یا برای مرور روی دکمه کلیک کنید',
    browse_button: 'انتخاب پوشه',
  },
};
