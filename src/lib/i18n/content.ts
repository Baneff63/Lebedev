export type Locale = "ru" | "en";

export const content = {
  ru: {
    meta: {
      title: "baneoff — сведение и мастеринг треков",
      description:
        "Даниил Лебедев (baneoff) — инженер сведения и мастеринга. 6+ лет опыта, 20+ завершённых релизов для инди-артистов. Обсудим ваш трек.",
    },
    nav: {
      about: "Обо мне",
      work: "Портфолио",
      contact: "Контакт",
    },
    hud: {
      scroll: "scroll",
      bpm: "bpm",
    },
    marquee: [
      "Сведение",
      "Мастеринг",
      "FL Studio",
      "Cubase",
      "Waves",
      "Fabfilter",
      "baneoff",
      "без шума",
      "20+ релизов",
      "6 лет опыта",
      "Serum",
      "Arturia",
      "Antares",
      "Xpand",
    ],
    hero: {
      eyebrow: "Сведение и мастеринг",
      line1: "Звук, которому",
      line2: "можно доверить",
      line3: "релиз.",
      subheadline:
        "Свожу и мастерю треки для инди-артистов уже 6 лет. Чисто, стабильно, без лишнего шума в процессе.",
      ctaPrimary: "Обсудить проект",
      ctaSecondary: "Послушать работы",
      status: "открыт для проектов",
      trust: "20+ завершённых релизов",
    },
    about: {
      label: "01 — Обо мне",
      headline: "Свожу музыку.\nСлышу баланс.",
      body: "Инженер сведения и мастеринга. Шесть лет в продакшене, больше двадцати завершённых проектов. Не гонюсь за трендами: делаю чисто, стабильно и без лишнего шума.",
      highlightsLabel: "Коротко",
      highlights: [
        "От демо до релиза — полный цикл сведения и мастеринга",
        "Работаю с инди-артистами и игровыми студиями",
        "Референс-трек и правки — в стоимость проекта",
      ],
      stats: [
        { target: 6, suffix: "+", label: "лет в сведении" },
        { target: 20, suffix: "+", label: "сведённых проектов" },
        { symbol: "∞", label: "часов в наушниках" },
      ],
      tools: {
        label: "Инструменты",
        items: ["FL Studio", "Cubase", "Waves", "Fabfilter", "Serum", "Xpand", "Antares", "Arturia"],
      },
    },
    work: {
      label: "02 — Портфолио",
      headline: "Слушай, как\nзвучит результат.",
      body: "Треки, над которыми я работал: сведение, мастеринг, продакшн. Плейлист обновляется по мере новых релизов — включай и слушай прямо здесь.",
      trackCountLabel: "треков в плейлисте",
      emptyTitle: "Плейлист пока пуст",
      emptyBody: "Скоро здесь появятся треки — загружу их через админку.",
      cursorPlay: "играть",
      cursorPause: "пауза",
      servicesLabel: "Услуги",
      services: ["Сведение", "Мастеринг", "Продакшн"],
      listenLabel: "Слушать на",
    },
    contact: {
      label: "03 — Контакт",
      headline: "Готовы\nсделать трек лучше?",
      body: "Пришлите демо или референс — отвечу с оценкой сроков и стоимости сведения или мастеринга. Telegram или почта, без форм и ботов.",
      cta: "Написать в Telegram",
      ctaSub: "Обычно отвечаю в течение дня",
      email: "Или на почту",
      cursorLabel: "say hi",
      socialsLabel: "Соцсети и площадки",
    },
    footer: {
      name: "Лебедев Даниил",
      handle: "baneoff",
      rights: "Все права защищены",
      backToTop: "Наверх",
      tagline: "Сведение и мастеринг без лишнего шума",
    },
  },
  en: {
    meta: {
      title: "baneoff — mixing & mastering engineer",
      description:
        "Daniil Lebedev (baneoff) — mixing & mastering engineer. 6+ years of experience, 20+ finished releases for indie artists. Let's talk about your track.",
    },
    nav: {
      about: "About",
      work: "Portfolio",
      contact: "Contact",
    },
    hud: {
      scroll: "scroll",
      bpm: "bpm",
    },
    marquee: [
      "Mixing",
      "Mastering",
      "FL Studio",
      "Cubase",
      "Waves",
      "Fabfilter",
      "baneoff",
      "no noise",
      "20+ releases",
      "6 years",
    ],
    hero: {
      eyebrow: "Mixing & mastering",
      line1: "Sound you can",
      line2: "trust with",
      line3: "your release.",
      subheadline:
        "I mix and master tracks for indie artists and game projects. Six years in, clean and consistent — no noise around the process.",
      ctaPrimary: "Discuss a project",
      ctaSecondary: "Listen to the work",
      status: "open for projects",
      trust: "20+ finished releases",
    },
    about: {
      label: "01 — About",
      headline: "I mix music.\nI hear balance.",
      body: "Mixing & mastering engineer. Six years in production, twenty-plus completed projects — from indie artists to game soundtracks. No trends chased — just clean, consistent work.",
      highlightsLabel: "In short",
      highlights: [
        "Full-cycle mixing and mastering, from demo to release",
        "Working with indie artists and game studios",
        "Reference track and revisions included in every project",
      ],
      stats: [
        { target: 6, suffix: "+", label: "years mixing" },
        { target: 20, suffix: "+", label: "mixed projects" },
        { symbol: "∞", label: "hours in headphones" },
      ],
      tools: {
        label: "Stack",
        items: ["FL Studio", "Cubase", "Waves", "Fabfilter"],
      },
    },
    work: {
      label: "02 — Portfolio",
      headline: "Listen to\nthe result.",
      body: "Tracks I've mixed, mastered, or produced. The playlist grows with every new release — press play and hear it right here.",
      trackCountLabel: "tracks in the playlist",
      emptyTitle: "Playlist is empty for now",
      emptyBody: "Tracks will show up here soon — uploaded straight from the admin panel.",
      cursorPlay: "play",
      cursorPause: "pause",
      servicesLabel: "Services",
      services: ["Mixing", "Mastering", "Production"],
      listenLabel: "Listen on",
    },
    contact: {
      label: "03 — Contact",
      headline: "Ready to make\nyour track better?",
      body: "Send a demo or reference — I'll reply with a timeline and quote for mixing or mastering. Telegram or email, no forms, no bots.",
      cta: "Message on Telegram",
      ctaSub: "Usually reply within a day",
      email: "Or send an email",
      cursorLabel: "say hi",
      socialsLabel: "Socials & platforms",
    },
    footer: {
      name: "Daniil Lebedev",
      handle: "baneoff",
      rights: "All rights reserved",
      backToTop: "Back to top",
      tagline: "Mixing & mastering, no noise",
    },
  },
} as const;

export type Content = (typeof content)[Locale];

export const links = {
  telegram: "https://t.me/baneoff9",
  email: "mailto:dani1l.lebedev@yandex.ru",
  emailLabel: "dani1l.lebedev@yandex.ru",
  instagram: "",
  soundcloud: "",
  spotify: "",
} as const;

export const siteUrl = "https://baneoff.com";
