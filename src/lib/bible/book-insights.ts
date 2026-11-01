/**
 * Canonical Book Insights & Contextual Guide
 * Provides accessible, Christ-centered theological and cultural context
 * to overcome the blank canvas in inductive SOAP study.
 */

export interface BookInsight {
  genre: 'Torah & Law' | 'Historical Narrative' | 'Wisdom & Poetry' | 'Major Prophets' | 'Minor Prophets' | 'Gospel' | 'Church History' | 'Epistle' | 'Apocalypse';
  theme: string;
  setting: string;
  graceConnection: string;
}

export const BOOK_INSIGHTS: Record<string, BookInsight> = {
  gen: {
    genre: 'Torah & Law',
    theme: 'Origins, Covenant Promise, and Sovereign Faithfulness',
    setting: 'From Creation and the patriarchal journeys of Abraham, Isaac, and Jacob in Canaan.',
    graceConnection: 'Points toward the Seed of the woman (Gen 3:15) who will crush the serpent and bless all nations.',
  },
  psa: {
    genre: 'Wisdom & Poetry',
    theme: 'The Anatomy of the Soul: Honest Lament, Praise, and Trust',
    setting: 'Worship songs across centuries of Israel’s monarchy, exile, and temple devotion.',
    graceConnection: 'Jesus prayed and fulfilled the Psalms; they voice both our deepest human vulnerability and God’s steadfast love.',
  },
  pro: {
    genre: 'Wisdom & Poetry',
    theme: 'The Fear of the Lord as the Beginning of True Wisdom',
    setting: 'Solomonic court teachings on everyday righteousness, humility, speech, and justice.',
    graceConnection: 'Christ is the very wisdom of God incarnate (1 Cor 1:24), directing our steps toward life.',
  },
  isa: {
    genre: 'Major Prophets',
    theme: 'The Holy One of Israel and the Suffering Servant',
    setting: 'Jerusalem under Assyrian and Babylonian threats, addressing rebellion and future hope.',
    graceConnection: 'Foretells the Messiah who was pierced for our transgressions and poured out His soul for our redemption (Isa 53).',
  },
  mat: {
    genre: 'Gospel',
    theme: 'Jesus as the Promised King and Fulfillment of the Covenant',
    setting: 'First-century Galilee and Judea under Roman imperial occupation.',
    graceConnection: 'Jesus fulfills the Law and prophets, announcing a kingdom given freely to the poor in spirit.',
  },
  jhn: {
    genre: 'Gospel',
    theme: 'The Word Made Flesh: Believe and Have Life in His Name',
    setting: 'Eyewitness account of Jesus’ signs and private discourses with His disciples.',
    graceConnection: 'Reveals God’s boundless love: whoever drinks the living water will never thirst again.',
  },
  rom: {
    genre: 'Epistle',
    theme: 'The Righteousness of God Received Through Grace by Faith',
    setting: 'Paul writing to the diverse Jewish and Gentile house churches in Rome.',
    graceConnection: 'There is now no condemnation for those who are in Christ Jesus (Rom 8:1). Grace reigns through righteousness.',
  },
  eph: {
    genre: 'Epistle',
    theme: 'Alive in Christ, Reconciled into One Body, Walking in Love',
    setting: 'Written from prison to churches across Asia Minor exploring heavenly identity and daily armor.',
    graceConnection: 'By grace you have been saved through faith, not of works, so that no one can boast (Eph 2:8-9).',
  },
  php: {
    genre: 'Epistle',
    theme: 'Unshakable Joy in the Fellowship of Christ',
    setting: 'Paul imprisoned in Rome writing with deep warmth to his beloved Macedonian partners.',
    graceConnection: 'Christ emptied Himself taking the form of a servant; His peace surpasses all human understanding.',
  },
  col: {
    genre: 'Epistle',
    theme: 'The Supremacy and Sufficiency of Christ Over All Creation',
    setting: 'Written to counter syncretistic philosophies and legalism in the Lycus Valley.',
    graceConnection: 'In Him all the fullness of God dwells in bodily form, and you have been made complete in Him.',
  },
  rut: {
    genre: 'Historical Narrative',
    theme: 'Loyal Love (Hesed), Redemption, and Hidden Providence',
    setting: 'The dark period of the Judges, set during the barley harvest in Bethlehem.',
    graceConnection: 'Boaz acts as the kinsman-redeemer, prefiguring Christ who redeems outsiders into God’s family line.',
  },
};

export function getBookInsight(bookId: string, bookName: string): BookInsight {
  const normalizedId = bookId.toLowerCase().substring(0, 3);
  if (BOOK_INSIGHTS[normalizedId]) {
    return BOOK_INSIGHTS[normalizedId];
  }

  // Graceful canonical default for other books
  return {
    genre: 'Historical Narrative',
    theme: `God's self-revelation and covenant relationship in ${bookName}`,
    setting: `Preserved throughout biblical history to guide our understanding of God's character and will.`,
    graceConnection: `Every page of Scripture points to God's steadfast kindness and redemption in Christ Jesus.`,
  };
}
