/**
 * Curated Foundational Scripture Passages
 * Provides offline starter text across supported translations (WEB, BSB, KJV, ESV, NIV, NLT).
 * Includes publisher copyright notices for Tier 2 translations.
 */

import type { BibleChapter } from '../../types/bible';

export const SAMPLE_CHAPTERS: BibleChapter[] = [
  // ---------------------------------------------------------------------------
  // 1. Psalm 23
  // ---------------------------------------------------------------------------
  {
    id: 'web:PSA:23',
    translationId: 'web',
    bookId: 'PSA',
    bookName: 'Psalms',
    chapterNumber: 23,
    title: 'The Lord is My Shepherd',
    attribution: 'World English Bible (Public Domain)',
    verses: [
      { verseNumber: 1, text: 'Yahweh is my shepherd: I shall lack nothing.', isParagraphStart: true },
      { verseNumber: 2, text: 'He makes me lie down in green pastures. He leads me beside still waters.' },
      { verseNumber: 3, text: 'He restores my soul. He guides me in the paths of righteousness for his name’s sake.' },
      { verseNumber: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.', isParagraphStart: true },
      { verseNumber: 5, text: 'You prepare a table before me in the presence of my enemies. You have anointed my head with oil. My cup runs over.' },
      { verseNumber: 6, text: 'Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh’s house forever.' }
    ]
  },
  {
    id: 'bsb:PSA:23',
    translationId: 'bsb',
    bookId: 'PSA',
    bookName: 'Psalms',
    chapterNumber: 23,
    title: 'The Lord is My Shepherd',
    attribution: 'Berean Standard Bible (Public Domain CC0)',
    verses: [
      { verseNumber: 1, text: 'The LORD is my shepherd; I shall not want.', isParagraphStart: true },
      { verseNumber: 2, text: 'He makes me lie down in green pastures; He leads me beside quiet waters.' },
      { verseNumber: 3, text: 'He restores my soul; He guides me in the paths of righteousness for the sake of His name.' },
      { verseNumber: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for You are with me; Your rod and Your staff, they comfort me.', isParagraphStart: true },
      { verseNumber: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.' },
      { verseNumber: 6, text: 'Surely goodness and mercy will follow me all the days of my life, and I will dwell in the house of the LORD forever.' }
    ]
  },
  {
    id: 'kjv:PSA:23',
    translationId: 'kjv',
    bookId: 'PSA',
    bookName: 'Psalms',
    chapterNumber: 23,
    title: 'The Lord is My Shepherd',
    attribution: 'King James Version (Public Domain)',
    verses: [
      { verseNumber: 1, text: 'The LORD is my shepherd; I shall not want.', isParagraphStart: true },
      { verseNumber: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
      { verseNumber: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.' },
      { verseNumber: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.', isParagraphStart: true },
      { verseNumber: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
      { verseNumber: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' }
    ]
  },
  {
    id: 'nlt:PSA:23',
    translationId: 'nlt',
    bookId: 'PSA',
    bookName: 'Psalms',
    chapterNumber: 23,
    title: 'The Lord is My Shepherd',
    attribution: 'Scripture quotations marked (NLT) are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers.',
    verses: [
      { verseNumber: 1, text: 'The LORD is my shepherd; I have all that I need.', isParagraphStart: true },
      { verseNumber: 2, text: 'He lets me rest in green meadows; he leads me beside peaceful streams.' },
      { verseNumber: 3, text: 'He renews my strength. He guides me along right paths, bringing honor to his name.' },
      { verseNumber: 4, text: 'Even when I walk through the darkest valley, I will not be afraid, for you are close beside me. Your rod and your staff protect and comfort me.', isParagraphStart: true },
      { verseNumber: 5, text: 'You prepare a feast for me in the presence of my enemies. You honor me by anointing my head with oil. My cup overflows with blessings.' },
      { verseNumber: 6, text: 'Surely your goodness and unfailing love will pursue me all the days of my life, and I will live in the house of the LORD forever.' }
    ]
  },
  {
    id: 'esv:PSA:23',
    translationId: 'esv',
    bookId: 'PSA',
    bookName: 'Psalms',
    chapterNumber: 23,
    title: 'The Lord is My Shepherd',
    attribution: 'Scripture quotations are from the ESV® Bible, Copyright © 2001 by Crossway.',
    verses: [
      { verseNumber: 1, text: 'The LORD is my shepherd; I shall not want.', isParagraphStart: true },
      { verseNumber: 2, text: 'He makes me lie down in green pastures. He leads me beside still waters.' },
      { verseNumber: 3, text: 'He restores my soul. He leads me in paths of righteousness for his name’s sake.' },
      { verseNumber: 4, text: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.', isParagraphStart: true },
      { verseNumber: 5, text: 'You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.' },
      { verseNumber: 6, text: 'Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever.' }
    ]
  },
  {
    id: 'niv:PSA:23',
    translationId: 'niv',
    bookId: 'PSA',
    bookName: 'Psalms',
    chapterNumber: 23,
    title: 'The Lord is My Shepherd',
    attribution: 'Scripture quotations taken from The Holy Bible, New International Version® NIV®.',
    verses: [
      { verseNumber: 1, text: 'The LORD is my shepherd, I lack nothing.', isParagraphStart: true },
      { verseNumber: 2, text: 'He makes me lie down in green pastures, he leads me beside quiet waters,' },
      { verseNumber: 3, text: 'he refreshes my soul. He guides me along the right paths for his name’s sake.' },
      { verseNumber: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.', isParagraphStart: true },
      { verseNumber: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.' },
      { verseNumber: 6, text: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the LORD forever.' }
    ]
  },

  // ---------------------------------------------------------------------------
  // 2. John 15:1–8 (The True Vine)
  // ---------------------------------------------------------------------------
  {
    id: 'web:JHN:15',
    translationId: 'web',
    bookId: 'JHN',
    bookName: 'John',
    chapterNumber: 15,
    title: 'The Vine and the Branches',
    attribution: 'World English Bible (Public Domain)',
    verses: [
      { verseNumber: 1, text: '“I am the true vine, and my Father is the farmer.', isParagraphStart: true },
      { verseNumber: 2, text: 'Every branch in me that doesn’t bear fruit, he takes away. Every branch that bears fruit, he prunes, that it may bear more fruit.' },
      { verseNumber: 3, text: 'You are already pruned clean because of the word which I have spoken to you.' },
      { verseNumber: 4, text: 'Remain in me, and I in you. As the branch can’t bear fruit by itself, unless it remains in the vine, so neither can you, unless you remain in me.', isParagraphStart: true },
      { verseNumber: 5, text: 'I am the vine. You are the branches. He who remains in me, and I in him, bears much fruit, for apart from me you can do nothing.' },
      { verseNumber: 6, text: 'If a man doesn’t remain in me, he is thrown out as a branch, and is withered; and they gather them, throw them into the fire, and they are burned.' },
      { verseNumber: 7, text: 'If you remain in me, and my words remain in you, ask whatever you desire, and it will be done for you.' },
      { verseNumber: 8, text: 'In this is my Father glorified, that you bear much fruit; and so you will be my disciples.”' }
    ]
  },
  {
    id: 'nlt:JHN:15',
    translationId: 'nlt',
    bookId: 'JHN',
    bookName: 'John',
    chapterNumber: 15,
    title: 'The Vine and the Branches',
    attribution: 'Scripture quotations marked (NLT) are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers.',
    verses: [
      { verseNumber: 1, text: '“I am the true grapevine, and my Father is the gardener.', isParagraphStart: true },
      { verseNumber: 2, text: 'He cuts off every branch of mine that doesn’t produce fruit, and he prunes the branches that do bear fruit so they will produce even more.' },
      { verseNumber: 3, text: 'You have already been pruned and purified by the message I have given you.' },
      { verseNumber: 4, text: 'Remain in me, and I will remain in you. For a branch cannot produce fruit if it is severed from the vine, and you cannot be fruitful unless you remain in me.', isParagraphStart: true },
      { verseNumber: 5, text: '“Yes, I am the vine; you are the branches. Those who remain in me, and I in them, will produce much fruit. For apart from me you can do nothing.' },
      { verseNumber: 6, text: 'Anyone who does not remain in me is thrown away like a useless branch and withers. Such branches are gathered into a pile to be burned.' },
      { verseNumber: 7, text: 'But if you remain in me and my words remain in you, you may ask for anything you want, and it will be granted!' },
      { verseNumber: 8, text: 'When you produce much fruit, you are my true disciples. This brings great glory to my Father.”' }
    ]
  },
  {
    id: 'bsb:JHN:15',
    translationId: 'bsb',
    bookId: 'JHN',
    bookName: 'John',
    chapterNumber: 15,
    title: 'The Vine and the Branches',
    attribution: 'Berean Standard Bible (Public Domain CC0)',
    verses: [
      { verseNumber: 1, text: '“I am the true vine, and My Father is the keeper of the vineyard.', isParagraphStart: true },
      { verseNumber: 2, text: 'He cuts off every branch in Me that bears no fruit, and every branch that does bear fruit, He prunes to make it even more fruitful.' },
      { verseNumber: 3, text: 'You are already clean because of the word I have spoken to you.' },
      { verseNumber: 4, text: 'Remain in Me, and I will remain in you. Just as no branch can bear fruit by itself without remaining in the vine, so neither can you bear fruit without remaining in Me.', isParagraphStart: true },
      { verseNumber: 5, text: 'I am the vine; you are the branches. The one who remains in Me and I in him will bear much fruit. For apart from Me you can do nothing.' },
      { verseNumber: 6, text: 'If anyone does not remain in Me, he is like a branch that is thrown away and withers. Such branches are gathered, thrown into the fire, and burned.' },
      { verseNumber: 7, text: 'If you remain in Me and My words remain in you, ask whatever you wish, and it will be done for you.' },
      { verseNumber: 8, text: 'This is to My Father’s glory, that you bear much fruit, showing yourselves to be My disciples.”' }
    ]
  },

  // ---------------------------------------------------------------------------
  // 3. Romans 8:31–39 (More Than Conquerors)
  // ---------------------------------------------------------------------------
  {
    id: 'web:ROM:8',
    translationId: 'web',
    bookId: 'ROM',
    bookName: 'Romans',
    chapterNumber: 8,
    title: 'More Than Conquerors',
    attribution: 'World English Bible (Public Domain)',
    verses: [
      { verseNumber: 31, text: 'What then shall we say about these things? If God is for us, who can be against us?', isParagraphStart: true },
      { verseNumber: 32, text: 'He who didn’t spare his own Son, but delivered him up for us all, how would he not also with him freely give us all things?' },
      { verseNumber: 33, text: 'Who could bring a charge against God’s chosen ones? It is God who justifies.' },
      { verseNumber: 34, text: 'Who is he who condemns? It is Christ who died, yes rather, who was raised from the dead, who is at the right hand of God, who also makes intercession for us.' },
      { verseNumber: 35, text: 'Who shall separate us from the love of Christ? Could oppression, or anguish, or persecution, or famine, or nakedness, or peril, or sword?', isParagraphStart: true },
      { verseNumber: 37, text: 'No, in all these things, we are more than conquerors through him who loved us.' },
      { verseNumber: 38, text: 'For I am persuaded that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers,', isParagraphStart: true },
      { verseNumber: 39, text: 'nor height, nor depth, nor any other created thing, will be able to separate us from God’s love, which is in Christ Jesus our Lord.' }
    ]
  },
  {
    id: 'nlt:ROM:8',
    translationId: 'nlt',
    bookId: 'ROM',
    bookName: 'Romans',
    chapterNumber: 8,
    title: 'Nothing Can Separate Us from God’s Love',
    attribution: 'Scripture quotations marked (NLT) are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers.',
    verses: [
      { verseNumber: 31, text: 'What shall we say about such wonderful things as these? If God is for us, who can ever be against us?', isParagraphStart: true },
      { verseNumber: 32, text: 'Since he did not spare even his own Son but gave him up for us all, won’t he also give us everything else?' },
      { verseNumber: 33, text: 'Who dares accuse us whom God has chosen for his own? No one—for God himself has given us right standing with himself.' },
      { verseNumber: 34, text: 'Who then will condemn us? No one—for Christ Jesus died for us and was raised to life for us, and he is sitting in the place of honor at God’s right hand, pleading for us.' },
      { verseNumber: 35, text: 'Can anything ever separate us from Christ’s love? Does it mean he no longer loves us if we have trouble or calamity, or are persecuted, or hungry, or destitute, or in danger, or threatened with death?', isParagraphStart: true },
      { verseNumber: 37, text: 'No, despite all these things, overwhelming victory is ours through Christ, who loved us.' },
      { verseNumber: 38, text: 'And I am convinced that nothing can ever separate us from God’s love. Neither death nor life, neither angels nor demons, neither our fears for today nor our worries about tomorrow—not even the powers of hell can separate us from God’s love.', isParagraphStart: true },
      { verseNumber: 39, text: 'No power in the sky above or in the earth below—indeed, nothing in all creation will ever be able to separate us from the love of God that is revealed in Christ Jesus our Lord.' }
    ]
  }
];
