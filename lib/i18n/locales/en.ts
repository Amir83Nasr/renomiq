export default {
  // Common terms
  common: {
    app_title: 'Renomiq Renamer',
    choose_folder: 'Choose folder',
    change_folder: 'Change folder',
    apply_rename: 'Apply Rename',
    cancel: 'Cancel',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    replace: 'Replace',
    prefix: 'Prefix',
    suffix: 'Suffix',
    numbering: 'Numbering',
    number_width: 'Number Width',
    preview: 'Preview',
    settings: 'Settings',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    english: 'English',
    persian: 'Persian',
  },

  // Page specific
  home: {
    title: 'Renomiq Renamer',
    subtitle: 'Choose a folder, configure rename rules, and safely batch-rename files.',
    active_folder: 'Active folder:',
    no_changes_to_apply: 'No changes to apply.',
    rename_failed: 'Rename failed',
    rename_success: 'Files renamed successfully!',
  },

  // Components
  file_selector: {
    desktop_only_message:
      'Folder selection is only available in the desktop app. Run `pnpm tauri dev`.',
  },

  rule_editor: {
    title: 'Rename Rules',
    search_replace: 'Search & Replace',
    search_placeholder: 'Search for...',
    replace_placeholder: 'Replace with...',
    prefix: 'Prefix',
    suffix: 'Suffix',
    prefix_placeholder: 'e.g. IMG_',
    suffix_placeholder: 'e.g. _v1',
    numbering: 'Numbering',
    numbering_checkbox: 'Add incremental numbers at the end',
    number_width: 'Number width',
    number_width_label: 'Number width',
    digit_1: '1 digit (1, 2, 3)',
    digit_2: '2 digits (01, 02, 03)',
    digit_3: '3 digits (001, 002, 003)',
    digit_4: '4 digits (0001, 0002, 0003)',
    files_loaded: 'files loaded',
    conflicts_skipped: 'Conflicts and unchanged files are skipped automatically',
    apply_changes: 'Apply Changes',
    apply_rename_button: 'Apply Rename',
  },

  preview_panel: {
    title: 'Preview',
    number: '#',
    current_name: 'Current name',
    new_name: 'New name',
    status: 'Status',
    status_conflict: 'conflict',
    status_unchanged: 'unchanged',
    status_ok: 'OK',
    empty_message: 'Choose a folder to see files and preview rename results',
    original: 'Original',
    renamed: 'Renamed',
    no_preview_available: 'No preview available',
    conflicts_detected: 'Conflicts detected',
  },

  // Errors
  errors: {
    failed_to_load_folder: 'Failed to load folder',
    failed_to_apply_rename: 'Failed to apply rename',
    no_changes_to_apply: 'No changes to apply.',
  },

  // DropZone
  dropzone: {
    title: 'Drop files here',
    subtitle: 'or click the button to browse',
    browse_button: 'Browse Folder',
  },
};
