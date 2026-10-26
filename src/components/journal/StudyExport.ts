import type { StudyEntry } from '../../types/journal';

export function exportStudiesToMarkdown(studies: StudyEntry[]): void {
  const mdLines = [
    `# Charis Bible Study Journal Export`,
    `Exported: ${new Date().toLocaleString()}`,
    `Total Studies: ${studies.length}\n`,
    '---',
  ];

  for (const s of studies) {
    const ref = s.passageRef?.formatted || 'General Reflection';
    mdLines.push(`\n## ${s.title || `Study on ${ref}`}`);
    mdLines.push(`*Scripture Reference: ${ref}*`);
    mdLines.push(`*Date: ${new Date(s.updatedAt || s.createdAt).toLocaleDateString()}*`);

    if (s.observations) {
      mdLines.push(`\n### 1. Observation (What does it say?)`);
      mdLines.push(s.observations);
    }

    if (s.questionsContext) {
      mdLines.push(`\n### 2. Context & Questions (Historical / Literary)`);
      mdLines.push(s.questionsContext);
    }

    if (s.interpretation) {
      mdLines.push(`\n### 3. Interpretation (What does it mean?)`);
      mdLines.push(s.interpretation);
    }

    if (s.application) {
      mdLines.push(`\n### 4. Application (How does it shape my walk?)`);
      mdLines.push(s.application);
    }

    if (s.notes) {
      mdLines.push(`\n### Additional Reflections`);
      mdLines.push(s.notes);
    }

    if (s.crossReferences?.length) {
      const refs = s.crossReferences.map((r) => r.formatted || r.bookId).join(', ');
      mdLines.push(`\n*Cross References: ${refs}*`);
    }

    mdLines.push('\n---');
  }

  const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Charis-Studies-${new Date().toISOString().slice(0, 10)}.md`;
  link.click();
  URL.revokeObjectURL(url);
}
