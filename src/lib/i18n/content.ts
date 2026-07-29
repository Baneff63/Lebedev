export type Locale = "ru" | "en";

export const content = {
  ru: {
    meta: {
      title: "baneoff — инженер сведения и мастеринга",
      description:
        "Лебедев Даниил. Инженер сведения и мастеринга. Свожу треки для артистов и инди-проектов — без лишнего шума.",
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
      "mixing engineer",
      "baneoff",
      "no noise",
      "mastering",
      "mix",
      "better",
    ],
    hero: {
      line1: "Без шума.",
      line2: "Просто",
      line3: "лучше.",
      role: "mixing engineer",
      scroll: "листай",
      status: "ready to mix",
    },
    about: {
      label: "01 — Обо мне",
      headline: "Свожу музыку.\nСлышу баланс.\nДелаю стабильно хорошо.",
      body: "Инженер сведения и мастеринга. Шесть лет в продакшене, больше двадцати завершённых проектов — от инди-артистов до игровых саундтреков. FL Studio, Cubase, Waves, Fabfilter — инструменты, а не повод для хвастовства. Не гонюсь за трендами: делаю чисто, стабильно и без лишнего шума.",
      stats: [
        { target: 6, suffix: "+", label: "лет в сведении" },
        { target: 20, suffix: "+", label: "сведённых проектов" },
        { symbol: "∞", label: "часов в наушниках" },
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
      label: "03 — Треки",
      headline: "Слушай, как\nзвучит результат.",
      body: "Треки, над которыми я работал: сведение, мастеринг, продакшн. Плейлист обновляется по мере новых релизов — включай и слушай прямо здесь.",
      trackCountLabel: "треков в плейлисте",
      emptyTitle: "Плейлист пока пуст",
      emptyBody: "Скоро здесь появятся треки — загружу их через админку.",
      cursorPlay: "играть",
      cursorPause: "пауза",
    },
    contact: {
      label: "04 — Контакт",
      headline: "Напиши —\nответу.",
      body: "Присылай трек — обсудим сведение, мастеринг и сроки. Telegram или почта, без форм и ботов.",
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
      title: "baneoff — mixing & mastering engineer",
      description:
        "Daniil Lebedev. Mixing & mastering engineer. Clean, consistent mixes for artists and indie projects.",
    },
    nav: {
      about: "About",
      philosophy: "Principles",
      work: "Tracks",
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
      "mixing engineer",
      "baneoff",
      "no noise",
      "mastering",
      "mix",
      "better",
    ],
    hero: {
      line1: "No noise.",
      line2: "Just",
      line3: "better.",
      role: "mixing engineer",
      scroll: "scroll",
      status: "ready to mix",
    },
    about: {
      label: "01 — About",
      headline: "I mix music.\nI hear balance.\nI keep it consistent.",
      body: "Mixing & mastering engineer. Six years in production, twenty-plus completed projects — from indie artists to game soundtracks. FL Studio, Cubase, Waves, Fabfilter are tools, not bragging rights. No trends chased — just clean, consistent work.",
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
      label: "03 — Tracks",
      headline: "Listen to\nthe result.",
      body: "Tracks I've mixed, mastered, or produced. The playlist grows with every new release — press play and hear it right here.",
      trackCountLabel: "tracks in the playlist",
      emptyTitle: "Playlist is empty for now",
      emptyBody: "Tracks will show up here soon — uploaded straight from the admin panel.",
      cursorPlay: "play",
      cursorPause: "pause",
    },
    contact: {
      label: "04 — Contact",
      headline: "Write me —\nI'll reply.",
      body: "Send your track — let's talk mixing, mastering, and timelines. Telegram or email, no forms, no bots.",
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