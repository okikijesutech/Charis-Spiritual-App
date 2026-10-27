/**
 * Comprehensive Data Export Manager
 * Generates documented, machine-readable JSON and Markdown data archives
 * of all user prayers, study journals, activity logs, reading plans, and schedules.
 * Per docs/PRD.md FR-12, docs/SECURITY.md Section 10, and docs/DATA-MODEL.md.
 */

import { prayerRepository } from '../db/prayer-repository';
import { studyRepository } from '../db/study-repository';
import { activityRepository } from '../db/activity-repository';
import { planRepository } from '../db/plan-repository';
import { scheduleRepository } from '../db/schedule-repository';
import { settingsRepository } from '../db/settings-repository';

import type { PrayerEntry, StudyEntry } from '../../types/journal';
import type { ActivityLog } from '../../types/activity';
import type { ReadingPlan } from '../../types/plan';
import type { Schedule } from '../../types/schedule';
import type { LocalUserSettings } from '../../types/settings';

export interface CharisDataExport {
  exportMetadata: {
    exportVersion: string;
    schemaVersion: number;
    exportedAt: string;
    app: string;
    userId: string;
    summary: {
      prayerCount: number;
      studyCount: number;
      activityCount: number;
      planCount: number;
      scheduleCount: number;
    };
  };
  prayers: PrayerEntry[];
  studies: StudyEntry[];
  activities: ActivityLog[];
  readingPlans: ReadingPlan[];
  schedules: Schedule[];
  settings?: LocalUserSettings;
}

export class ExportManager {
  /**
   * Aggregate complete user data across all IndexedDB domain stores.
   * Filters out soft-deleted tombstones to ensure clean data exports.
   */
  async generateFullExport(userId: string): Promise<CharisDataExport> {
    const [allPrayers, allStudies, allActivities, allPlans, allSchedules, userSettings] =
      await Promise.all([
        prayerRepository.list(userId),
        studyRepository.list(userId),
        activityRepository.list(userId),
        planRepository.list(userId),
        scheduleRepository.list(userId),
        settingsRepository.getSettings(userId),
      ]);

    const activePrayers = allPrayers.filter((p) => !p.deletedAt);
    const activeStudies = allStudies.filter((s) => !s.deletedAt);
    const activeActivities = allActivities.filter((a) => !a.deletedAt);
    const activePlans = allPlans.filter((p) => !p.deletedAt);
    const activeSchedules = allSchedules.filter((s) => !s.deletedAt);

    return {
      exportMetadata: {
        exportVersion: '1.0',
        schemaVersion: 4,
        exportedAt: new Date().toISOString(),
        app: 'Charis Spiritual Discipline PWA',
        userId,
        summary: {
          prayerCount: activePrayers.length,
          studyCount: activeStudies.length,
          activityCount: activeActivities.length,
          planCount: activePlans.length,
          scheduleCount: activeSchedules.length,
        },
      },
      prayers: activePrayers,
      studies: activeStudies,
      activities: activeActivities,
      readingPlans: activePlans,
      schedules: activeSchedules,
      settings: userSettings,
    };
  }

  /**
   * Trigger machine-readable JSON download with metadata.
   */
  downloadJson(data: CharisDataExport): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `Charis-Complete-Export-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Trigger formatted Markdown export for human-readable archival.
   */
  downloadMarkdown(data: CharisDataExport): void {
    const lines: string[] = [
      `# Charis Spiritual Discipline Archive`,
      `*Exported on: ${new Date(data.exportMetadata.exportedAt).toLocaleString()}*`,
      `*Application: Charis Spiritual Discipline PWA (v1.0)*\n`,
      `## Summary`,
      `- **Prayers Recorded:** ${data.exportMetadata.summary.prayerCount}`,
      `- **Inductive Studies:** ${data.exportMetadata.summary.studyCount}`,
      `- **Spiritual Rhythms Logged:** ${data.exportMetadata.summary.activityCount}`,
      `- **Reading Plans:** ${data.exportMetadata.summary.planCount}`,
      `- **Schedules:** ${data.exportMetadata.summary.scheduleCount}\n`,
      `---`,
    ];

    // 1. Prayers Section
    lines.push(`\n# 1. Prayer Journal Entries\n`);
    if (data.prayers.length === 0) {
      lines.push(`*No prayer entries recorded.*`);
    } else {
      for (const p of data.prayers) {
        lines.push(`\n### ${p.title || 'Quiet Prayer'}`);
        lines.push(`*Date: ${new Date(p.entryAt).toLocaleDateString()}*`);
        if (p.isAnswered) {
          lines.push(`*Answered: Yes*`);
          if (p.answeredNote) lines.push(`> Testimony: ${p.answeredNote}`);
        }
        if (p.tags?.length) lines.push(`*Tags: ${p.tags.join(', ')}*`);
        lines.push(`\n${p.body}\n`);
      }
    }

    // 2. Studies Section
    lines.push(`\n---\n# 2. Bible Study Journal Entries\n`);
    if (data.studies.length === 0) {
      lines.push(`*No inductive study entries recorded.*`);
    } else {
      for (const s of data.studies) {
        lines.push(`\n### ${s.title || (s.passageRef?.formatted ? `Study on ${s.passageRef.formatted}` : 'Study Reflection')}`);
        if (s.passageRef?.formatted) lines.push(`*Passage: ${s.passageRef.formatted}*`);
        lines.push(`*Date: ${new Date(s.createdAt).toLocaleDateString()}*`);
        if (s.observations) lines.push(`\n**Observation:**\n${s.observations}`);
        if (s.questionsContext) lines.push(`\n**Context & Questions:**\n${s.questionsContext}`);
        if (s.interpretation) lines.push(`\n**Interpretation:**\n${s.interpretation}`);
        if (s.application) lines.push(`\n**Application:**\n${s.application}`);
        if (s.notes) lines.push(`\n**Personal Notes:**\n${s.notes}`);
      }
    }

    // 3. Activity Section
    lines.push(`\n---\n# 3. Spiritual Rhythm Logs\n`);
    if (data.activities.length === 0) {
      lines.push(`*No activity logs recorded.*`);
    } else {
      for (const a of data.activities) {
        const duration = a.durationSeconds ? ` (${Math.round(a.durationSeconds / 60)} min)` : '';
        lines.push(`- **${new Date(a.startedAt).toLocaleDateString()}** · ${a.label} [${a.category}]${duration}${a.note ? ` — *"${a.note}"*` : ''}`);
      }
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `Charis-Complete-Export-${dateStr}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const exportManager = new ExportManager();
