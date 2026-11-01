/**
 * Guided SOAP Prompts & Thought Starters
 * Provides one-tap mental scaffolds for unhurried inductive reflection.
 */

export interface SoapPromptChip {
  id: string;
  label: string;
  starterText: string;
}

export const OBSERVATION_PROMPTS: SoapPromptChip[] = [
  {
    id: 'obs-char',
    label: "God's Character",
    starterText: "In this passage, I observe that God is revealed as ",
  },
  {
    id: 'obs-repeat',
    label: 'Repeating Words',
    starterText: "A key word or repeated phrase that stands out to me is '",
  },
  {
    id: 'obs-turning',
    label: 'Turning Point',
    starterText: 'The main turning point or contrast in this text occurs when ',
  },
  {
    id: 'obs-speakers',
    label: 'Tone & Voices',
    starterText: 'The tone of the speaker in this passage communicates ',
  },
];

export const APPLICATION_PROMPTS: SoapPromptChip[] = [
  {
    id: 'app-trust',
    label: 'Promise to Anchor In',
    starterText: 'Today I can rest in the promise that ',
  },
  {
    id: 'app-heart',
    label: 'Heart Shift',
    starterText: 'The Holy Spirit is inviting me to let go of ',
  },
  {
    id: 'app-action',
    label: 'Walking in Grace',
    starterText: 'In response to this truth, today I will practically ',
  },
  {
    id: 'app-neighbor',
    label: 'Loving Others',
    starterText: 'I can reflect this kindness to my family or neighbor by ',
  },
];

export const PRAYER_PROMPTS: SoapPromptChip[] = [
  {
    id: 'pry-adoration',
    label: 'Praise & Thanksgiving',
    starterText: 'Lord, I praise You for Your steadfast faithfulness, because ',
  },
  {
    id: 'pry-surrender',
    label: 'Humble Surrender',
    starterText: 'Father, forgive me where I have tried to rely on my own strength. I give You ',
  },
  {
    id: 'pry-petition',
    label: 'Petition for Grace',
    starterText: 'Holy Spirit, fill me with Your peace and give me the grace to ',
  },
];
