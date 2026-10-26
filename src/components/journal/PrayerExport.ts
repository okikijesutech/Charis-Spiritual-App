import type { PrayerEntry } from '../../types/journal';

export function exportPrayersToMarkdown(prayers: PrayerEntry[]): void {
  const mdLines = [
    `# Charis Prayer Journal Export`,
    `Exported: ${new Date().toLocaleString()}`,
    `Total Entries: ${prayers.length}\n`,
    '---',
  ];

  for (const p of prayers) {
    mdLines.push(`\n## ${p.title || 'Quiet Reflection'}`);
    mdLines.push(`*Date: ${new Date(p.entryAt).toLocaleDateString()}*`);
    if (p.scriptureReferences?.[0]?.formatted) {
      mdLines.push(`*Scripture: ${p.scriptureReferences[0].formatted}*`);
    }
    if (p.isAnswered) {
      mdLines.push(
        `*Status: Answered (${p.answeredAt ? new Date(p.answeredAt).toLocaleDateString() : 'Yes'})*`
      );
      if (p.answeredNote) mdLines.push(`> Testimony: ${p.answeredNote}`);
    }
    if (p.tags?.length) {
      mdLines.push(`*Tags: ${p.tags.join(', ')}*`);
    }
    mdLines.push(`\n${p.body}\n\n---`);
  }

  const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Charis-Prayers-${new Date().toISOString().slice(0, 10)}.md`;
  link.click();
  URL.revokeObjectURL(url);
}
