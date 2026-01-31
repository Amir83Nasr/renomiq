import { applyRenameRules, buildPreview, type FileEntry } from './rename-rules';

function makeFiles(names: string[]): FileEntry[] {
  return names.map((name, i) => ({
    path: `/tmp/${name}`,
    name,
    extension: name.includes('.') ? (name.split('.').pop() ?? '') : '',
  }));
}

describe('rename rules', () => {
  it('applies prefix and suffix', () => {
    const rules = applyRenameRules({
      search: '',
      replace: '',
      prefix: 'PRE_',
      suffix: '_SFX',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['a.txt']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('PRE_a_SFX.txt');
  });

  it('applies search and replace', () => {
    const rules = applyRenameRules({
      search: 'foo',
      replace: 'bar',
      prefix: '',
      suffix: '',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['foo.txt']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('bar.txt');
  });

  it('adds numbering', () => {
    const rules = applyRenameRules({
      search: '',
      replace: '',
      prefix: 'file',
      suffix: '',
      numbering: true,
      numberWidth: 1,
    });

    const files = makeFiles(['a.txt', 'b.txt']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('filea_1.txt');
    expect(preview[1].newName).toBe('fileb_2.txt');
  });

  it('marks conflicts when targets duplicate', () => {
    const rules = applyRenameRules({
      search: 'a',
      replace: '',
      prefix: '',
      suffix: '',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['a.txt', 'aa.txt']);
    const preview = buildPreview(files, rules);

    expect(preview[0].conflict).toBe(true);
    expect(preview[1].conflict).toBe(true);
  });

  it('handles dotfiles correctly', () => {
    const rules = applyRenameRules({
      search: '',
      replace: '',
      prefix: 'pref_',
      suffix: '_sfx',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['.gitignore', '.env', 'config.json']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('pref_.gitignore_sfx');
    expect(preview[1].newName).toBe('pref_.env_sfx');
    expect(preview[2].newName).toBe('pref_config_sfx.json');
  });

  it('handles dotfiles with search-replace', () => {
    const rules = applyRenameRules({
      search: 'git',
      replace: 'hg',
      prefix: '',
      suffix: '',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['.gitignore', '.gitattributes']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('.hgignore');
    expect(preview[1].newName).toBe('.hgattributes');
  });

  it('handles files without extensions', () => {
    const rules = applyRenameRules({
      search: '',
      replace: '',
      prefix: 'file_',
      suffix: '_backup',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['README', 'LICENSE', 'Makefile']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('file_README_backup');
    expect(preview[1].newName).toBe('file_LICENSE_backup');
    expect(preview[2].newName).toBe('file_Makefile_backup');
  });

  it('handles files with multiple dots', () => {
    const rules = applyRenameRules({
      search: '',
      replace: '',
      prefix: 'backup.',
      suffix: '',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['archive.tar.gz', 'config.yml.example']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('backup.archive.tar.gz');
    expect(preview[1].newName).toBe('backup.config.yml.example');
  });

  it('handles special characters in filenames', () => {
    const rules = applyRenameRules({
      search: ' ',
      replace: '_',
      prefix: '',
      suffix: '',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['my file.txt', 'another one (copy).jpg', 'test@123.png']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('my_file.txt');
    expect(preview[1].newName).toBe('another_one_(copy).jpg');
    // test@123.png has no spaces, so it shouldn't change
    expect(preview[2].newName).toBe(null);
    expect(preview[2].changed).toBe(false);
  });

  it('handles empty search string gracefully', () => {
    const rules = applyRenameRules({
      search: '',
      replace: 'prefix_',
      prefix: '',
      suffix: '',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['test.txt']);
    const preview = buildPreview(files, rules);

    // Empty search should not create a rule, so no changes
    expect(preview[0].newName).toBe(null);
    expect(preview[0].changed).toBe(false);
  });

  it('handles numbering with existing numbers', () => {
    const rules = applyRenameRules({
      search: '',
      replace: '',
      prefix: 'item',
      suffix: '',
      numbering: true,
      numberWidth: 1,
    });

    const files = makeFiles(['item1.txt', 'item2.txt', 'item3.txt']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('itemitem1_1.txt');
    expect(preview[1].newName).toBe('itemitem2_2.txt');
    expect(preview[2].newName).toBe('itemitem3_3.txt');
  });

  it('detects conflicts across directories correctly', () => {
    const rules = applyRenameRules({
      search: 'a',
      replace: '',
      prefix: '',
      suffix: '',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['a.txt', 'aa.txt', 'aaa.txt']);
    const preview = buildPreview(files, rules);

    // All three files will become ".txt" - should all be marked as conflicts
    expect(preview[0].conflict).toBe(true);
    expect(preview[1].conflict).toBe(true);
    expect(preview[2].conflict).toBe(true);
    expect(preview[0].newName).toBe('.txt');
    expect(preview[1].newName).toBe('.txt');
    expect(preview[2].newName).toBe('.txt');
  });

  it('handles complex multi-step renaming', () => {
    const rules = applyRenameRules({
      search: 'IMG',
      replace: 'PHOTO',
      prefix: '2024_',
      suffix: '_edited',
      numbering: true,
      numberWidth: 1,
    });

    const files = makeFiles(['IMG001.jpg', 'IMG002.jpg', 'IMG003.jpg']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('2024_PHOTO001_edited_1.jpg');
    expect(preview[1].newName).toBe('2024_PHOTO002_edited_2.jpg');
    expect(preview[2].newName).toBe('2024_PHOTO003_edited_3.jpg');
  });

  it('handles unicode and international characters', () => {
    const rules = applyRenameRules({
      search: '',
      replace: '',
      prefix: '📁',
      suffix: '',
      numbering: false,
      numberWidth: 1,
    });

    const files = makeFiles(['файл.txt', 'ファイル.jpg', '📄document.pdf']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('📁файл.txt');
    expect(preview[1].newName).toBe('📁ファイル.jpg');
    expect(preview[2].newName).toBe('📁📄document.pdf');
  });

  it('pads numbering to two digits when width is 2', () => {
    const rules = applyRenameRules({
      search: '',
      replace: '',
      prefix: 'ep',
      suffix: '',
      numbering: true,
      numberWidth: 2,
    });

    const files = makeFiles(['a.mkv', 'b.mkv', 'c.mkv']);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('epa_01.mkv');
    expect(preview[1].newName).toBe('epb_02.mkv');
    expect(preview[2].newName).toBe('epc_03.mkv');
  });

  it('pads numbering to three digits when width is 3', () => {
    const rules = applyRenameRules({
      search: '',
      replace: '',
      prefix: 'ep',
      suffix: '',
      numbering: true,
      numberWidth: 3,
    });

    const files = makeFiles([
      'a.mkv',
      'b.mkv',
      'c.mkv',
      'd.mkv',
      'e.mkv',
      'f.mkv',
      'g.mkv',
      'h.mkv',
      'i.mkv',
      'j.mkv',
    ]);
    const preview = buildPreview(files, rules);

    expect(preview[0].newName).toBe('epa_001.mkv');
    expect(preview[9].newName).toBe('epj_010.mkv');
  });
});
