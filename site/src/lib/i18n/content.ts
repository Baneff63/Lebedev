export type Locale = "ru" | "en";

export const content = {
  ru: {
    meta: {
      title: "baneoff — sound producer",
      description:
        "Лебедев Даниил. Sound producer. Стабильно лучше — без лишнего шума.",
    },
    nav: {
      about: "Обо мне",
      philosophy: "Принципы",
      work: "Работы",
      contact: "Контакт",
    },
    hud: {
      scroll: "scroll",
      bpm: "bpm",
    },
    marquee: [
      "FL Studio",
      "Cubase",
      "Waves",
      "Fabfilter",
      "sound producer",
      "baneoff",
      "no noise",
      "NDA",
      "mix",
      "better",
    ],
    hero: {
      line1: "Без шума.",
      line2: "Просто",
      line3: "лучше.",
      role: "sound producer",
      scroll: "листай",
      status: "ready to mix",
    },
    about: {
      label: "01 — Обо мне",
      headline: "Свожу музыку.\nИграю в шутеры.\nДелаю стабильно хорошо.",
      body: "Шесть лет в продакшене, более двадцати крупных проектов. FL Studio, Cubase, Waves, Fabfilter — инструменты, а не повод для хвастовства. Не гонюсь за трендами: просто делаю со вкусом и без лишнего.",
      stats: [
        { target: 6, suffix: "+", label: "лет в деле" },
        { target: 20, suffix: "+", label: "крупных проектов" },
        { symbol: "∞", label: "часов в шутерах" },
      ],
      tools: {
        label: "Стек",
        items: ["FL Studio", "Cubase", "Waves", "Fabfilter"],
      },
    },
    philosophy: {
      label: "02 — Принципы",
      headline: "Без манифестов.\nТолько то, что работает.",
      side: "принципы",
      items: [
        {
          num: "01",
          title: "Простота — не упрощение",
          body: "Убираю лишнее, пока не останется только то, что звучит и работает.",
        },
        {
          num: "02",
          title: "Стабильность важнее хайпа",
          body: "Не гонюсь за трендами. Делаю так, чтобы результат держался каждый раз.",
        },
        {
          num: "03",
          title: "Инструменты — не цель",
          body: "FL Studio, Cubase, плагины — средство. Считается только финальный микс.",
        },
        {
          num: "04",
          title: "Не удивляю — выполняю",
          body: "Без лишнего шума вокруг процесса. Просто стабильно хороший результат.",
        },
      ],
    },
    work: {
      label: "03 — Работы",
      headline: "Больше двадцати проектов.\nПоказать — нельзя.",
      body: "Большая часть работ под NDA. Превью заблокированы — не потому что нечего показать, а потому что так договорились.",
      nda: "NDA",
      placeholder: "Скоро добавлю то, что можно показать.",
      cursorLabel: "locked",
      projects: [
        { title: "Commercial mix", tag: "2024" },
        { title: "Game soundtrack", tag: "2023" },
        { title: "Artist production", tag: "2025" },
        { title: "Brand audio", tag: "2022" },
      ],
    },
    contact: {
      label: "04 — Контакт",
      headline: "Напиши —\nотвечу.",
      body: "Telegram или почта. Без форм и ботов.",
      cta: "Написать в Telegram",
      email: "Или на почту",
      cursorLabel: "say hi",
    },
    footer: {
      name: "Лебедев Даниил",
      handle: "baneoff",
      rights: "Все права защищены",
      backToTop: "Наверх",
    },
  },
  en: {
    meta: {
      title: "baneoff — sound producer",
      description:
        "Daniil Lebedev. Sound producer. Consistently better — without the noise.",
    },
    nav: {
      about: "About",
      philosophy: "Principles",
      work: "Work",
      contact: "Contact",
    },
    hud: {
      scroll: "scroll",
      bpm: "bpm",
    },
    marquee: [
      "FL Studio",
      "Cubase",
      "Waves",
      "Fabfilter",
      "sound producer",
      "baneoff",
      "no noise",
      "NDA",
      "mix",
      "better",
    ],
    hero: {
      line1: "No noise.",
      line2: "Just",
      line3: "better.",
      role: "sound producer",
      scroll: "scroll",
      status: "ready to mix",
    },
    about: {
      label: "01 — About",
      headline: "I mix music.\nPlay shooters.\nDo it consistently well.",
      body: "Six years in production, over twenty major projects. FL Studio, Cubase, Waves, Fabfilter — tools, not bragging rights. I don't chase trends: I keep it simple and tasteful.",
      stats: [
        { target: 6, suffix: "+", label: "years in the game" },
        { target: 20, suffix: "+", label: "major projects" },
        { symbol: "∞", label: "hours in shooters" },
      ],
      tools: {
        label: "Stack",
        items: ["FL Studio", "Cubase", "Waves", "Fabfilter"],
      },
    },
    philosophy: {
      label: "02 — Principles",
      headline: "No manifestos.\nJust what works.",
      side: "principles",
      items: [
        {
          num: "01",
          title: "Simplicity isn't dumbing down",
          body: "I strip away until only what sounds and works remains.",
        },
        {
          num: "02",
          title: "Consistency beats hype",
          body: "I don't chase trends. I deliver results that hold up every time.",
        },
        {
          num: "03",
          title: "Tools aren't the goal",
          body: "FL Studio, Cubase, plugins — means. Only the final mix counts.",
        },
        {
          num: "04",
          title: "I don't impress — I deliver",
          body: "No noise around the process. Just consistently solid output.",
        },
      ],
    },
    work: {
      label: "03 — Work",
      headline: "Twenty-plus projects.\nCan't show them.",
      body: "Most work is under NDA. Previews are locked — not because there's nothing to show, but because that's the deal.",
      nda: "NDA",
      placeholder: "Will add what I can show soon.",
      cursorLabel: "locked",
      projects: [
        { title: "Commercial mix", tag: "2024" },
        { title: "Game soundtrack", tag: "2023" },
        { title: "Artist production", tag: "2025" },
        { title: "Brand audio", tag: "2022" },
      ],
    },
    contact: {
      label: "04 — Contact",
      headline: "Write me —\nI'll reply.",
      body: "Telegram or email. No forms, no bots.",
      cta: "Message on Telegram",
      email: "Or send an email",
      cursorLabel: "say hi",
    },
    footer: {
      name: "Daniil Lebedev",
      handle: "baneoff",
      rights: "All rights reserved",
      backToTop: "Back to top",
    },
  },
} as const;

export type Content = (typeof content)[Locale];

export const links = {
  telegram: "https://t.me/baneoff9",
  email: "mailto:dani1l.lebedev@yandex.ru",
  emailLabel: "dani1l.lebedev@yandex.ru",
} as const;
