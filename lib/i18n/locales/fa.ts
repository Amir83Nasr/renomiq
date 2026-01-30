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
    all: 'همه',
    hold_shift_for_range_selection: 'برای انتخاب گروهی، Shift را نگه دارید و کلیک کنید',
    undo: 'برگشت',
    undo_success: 'تغییرات با موفقیت برگشت داده شد',
    confirm: 'تأیید',
    confirm_rename: 'تأیید تغییر نام',
    confirm_rename_description: 'آیا مطمئن هستید که می‌خواهید این تغییرات را اعمال کنید؟',
    files_to_rename: 'فایل‌های تغییر نام یافته',
    conflicts: 'تداخل‌ها',
    preview_changes: 'پیش‌نمایش تغییرات',
    more_files: 'فایل‌های بیشتر',
    processing: 'در حال پردازش...',
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
    undo_failed: 'خطا در برگرداندن تغییرات',
  },

  // DropZone
  dropzone: {
    title: 'فایل‌ها را اینجا رها کنید',
    subtitle: 'یا برای مرور روی دکمه کلیک کنید',
    browse_button: 'انتخاب پوشه',
  },

  // Series Renamer
  series_renamer: {
    title: 'تغییر نام سریال',
    tab_file: 'تغییر نام فایل',
    tab_series: 'تغییر نام پوشه',
    metadata_title: 'اطلاعات سریال',
    series_name: 'نام سریال',
    series_name_placeholder: 'مثال: Breaking Bad',
    season: 'شماره فصل',
    start_episode: 'شروع از قسمت',
    pattern_title: 'الگوی نام‌گذاری',
    pattern_custom: 'سفارشی',
    pattern_sxe_dash: 'S01E05 با خط تیره',
    pattern_sxe_dot: 'S01E05 با نقطه',
    pattern_sxe_space: 'S01E05 با فاصله',
    pattern_xsep: '1x05 فرمت',
    pattern_episode_only: 'فقط شماره قسمت',
    pattern_persian: 'فرمت فارسی',
    pattern_simple: 'ساده',
    stats_title: 'خلاصه',
    stats_groups_selected: 'گروه‌های انتخاب شده',
    stats_total_files: 'فایل‌های کل',
    stats_conflicts: 'تداخل‌ها',
    apply_changes: 'اعمال تغییرات',
    processing: 'در حال پردازش...',
    no_files_found: 'فایلی یافت نشد',
    active_folder: '📁 پوشه فعل:',
    select_all: 'انتخاب همه',
    conflict_warning: 'تداخل نام',
    subtitles_count: 'زیرنویس',
    dubs_count: 'دوبله',
    episode_number: 'قسمت',
  },

  // Media Types
  media_types: {
    video: 'ویدیو',
    subtitle: 'زیرنویس',
    dubbing: 'دوبله',
    other: 'سایر',
  },

  // Folder Renamer
  folder_renamer: {
    title: 'تغییر نام پوشه',
    parent_folder: 'پوشه والد:',
    folders_loaded: 'پوشه',
    no_folders_found: 'پوشه‌ای یافت نشد',
    success_message: 'پوشه با موفقیت تغییر نام یافت',
    undo_description: 'تغییر نام',
  },
};
