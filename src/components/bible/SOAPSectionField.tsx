import React from 'react';
import type { SoapPromptChip } from '../../lib/bible/soap-prompts';

interface SOAPSectionFieldProps {
  badgeLetter: string;
  badgeStyle: string;
  title: string;
  prompts: SoapPromptChip[];
  value: string;
  onChange: (val: string) => void;
  onAppendPrompt: (starterText: string) => void;
  placeholder: string;
  rows?: number;
  hoverBorderColor?: string;
  hoverTextColor?: string;
}

export const SOAPSectionField: React.FC<SOAPSectionFieldProps> = ({
  badgeLetter,
  badgeStyle,
  title,
  prompts,
  value,
  onChange,
  onAppendPrompt,
  placeholder,
  rows = 3,
  hoverBorderColor = 'hover:border-charis-primary/40',
  hoverTextColor = 'hover:text-charis-primary',
}) => {
  return (
    <section className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-serif font-bold text-charis-text flex items-center gap-1.5">
          <span className={`w-5 h-5 rounded-md text-center leading-5 font-mono text-[10px] font-bold ${badgeStyle}`}>
            {badgeLetter}
          </span>
          <span>{title}</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onAppendPrompt(chip.starterText)}
            className={`px-2 py-1 rounded-md bg-charis-surface border border-charis-border ${hoverBorderColor} ${hoverTextColor} text-[10px] transition-colors shadow-subtle`}
          >
            + {chip.label}
          </button>
        ))}
      </div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2.5 rounded-xl border border-charis-border bg-charis-surface text-xs text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-y"
      />
    </section>
  );
};
