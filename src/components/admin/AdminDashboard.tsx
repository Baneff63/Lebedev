"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { SiteData, Track, TrackPlatforms } from "@/types/site";
import type { Locale } from "@/lib/i18n/content";

type Tab = "tracks" | "content" | "links";

function newId() {
  return crypto.randomUUID();
}

function emptyTrack(): Track {
  return { id: newId(), title: "New track", artist: "baneoff", src: "" };
}

const PLATFORM_KEYS: (keyof TrackPlatforms)[] = ["spotify", "appleMusic", "youtube", "soundcloud"];

export function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [data, setData] = useState<SiteData | null>(null);
  const [locale, setLocale] = useState<Locale>("ru");
  const [tab, setTab] = useState<Tab>("tracks");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const checkSession = useCallback(async () => {
    const res = await fetch("/api/admin/session");
    const json = await res.json();
    setAuthenticated(json.authenticated);
    if (json.authenticated) {
      const contentRes = await fetch("/api/admin/content");
      if (contentRes.ok) setData(await contentRes.json());
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Неверный пароль");
      return;
    }
    setPassword("");
    await checkSession();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setData(null);
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setMessage(res.ok ? "Сохранено" : "Ошибка сохранения");
  };

  const uploadFile = async (file: File, trackIndex: number) => {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    setUploading(false);
    if (!res.ok) return;
    const { src } = await res.json();
    setData((prev) => {
      if (!prev) return prev;
      const tracks = [...prev.tracks];
      tracks[trackIndex] = { ...tracks[trackIndex], src };
      return { ...prev, tracks };
    });
  };

  const updateTrack = (index: number, patch: Partial<Track>) => {
    setData((prev) => {
      if (!prev) return prev;
      const tracks = [...prev.tracks];
      tracks[index] = { ...tracks[index], ...patch };
      return { ...prev, tracks };
    });
  };

  const updateTrackPlatform = (index: number, key: keyof TrackPlatforms, value: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const tracks = [...prev.tracks];
      tracks[index] = {
        ...tracks[index],
        platforms: { ...tracks[index].platforms, [key]: value },
      };
      return { ...prev, tracks };
    });
  };

  const moveTrack = (index: number, dir: -1 | 1) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = index + dir;
      if (next < 0 || next >= prev.tracks.length) return prev;
      const tracks = [...prev.tracks];
      [tracks[index], tracks[next]] = [tracks[next], tracks[index]];
      return { ...prev, tracks };
    });
  };

  const removeTrack = (index: number) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tracks: prev.tracks.filter((_, i) => i !== index),
      };
    });
  };

  const patchLocale = (path: string, value: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const copy = structuredClone(prev);
      const parts = path.split(".");
      let cursor: Record<string, unknown> = copy[locale] as Record<string, unknown>;
      for (let i = 0; i < parts.length - 1; i++) {
        cursor = cursor[parts[i]] as Record<string, unknown>;
      }
      cursor[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const patchLocaleList = (path: string, value: string) => {
    patchLocaleValue(path, value.split("\n").map((line) => line.trim()).filter(Boolean));
  };

  const patchLocaleValue = (path: string, value: unknown) => {
    setData((prev) => {
      if (!prev) return prev;
      const copy = structuredClone(prev);
      const parts = path.split(".");
      let cursor: Record<string, unknown> = copy[locale] as Record<string, unknown>;
      for (let i = 0; i < parts.length - 1; i++) {
        cursor = cursor[parts[i]] as Record<string, unknown>;
      }
      cursor[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
        <p className="text-sm text-muted">Загрузка…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-5">
        <form onSubmit={login} className="w-full max-w-sm border border-ink/10 p-8">
          <p className="font-display text-2xl text-ink">baneoff admin</p>
          <p className="mt-2 text-sm text-muted">Введи пароль для доступа к панели</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input mt-8"
            placeholder="Пароль"
            autoFocus
          />
          {loginError && <p className="mt-2 text-sm text-accent">{loginError}</p>}
          <button
            type="submit"
            className="mt-6 w-full border border-ink/15 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
          >
            Войти
          </button>
          <Link href="/" className="mt-4 block text-center text-[11px] text-muted hover:text-accent">
            ← На сайт
          </Link>
        </form>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-muted">Загрузка данных…</p>
      </div>
    );
  }

  const c = data[locale];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div>
            <p className="font-display text-lg">Admin</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">baneoff CMS</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[11px] uppercase tracking-[0.15em] text-muted hover:text-accent">
              Сайт
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-[11px] uppercase tracking-[0.15em] text-muted hover:text-accent"
            >
              Выйти
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="border border-ink/15 px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {saving ? "…" : "Сохранить"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
        {message && <p className="mb-6 text-sm text-accent">{message}</p>}

        <div className="mb-8 flex flex-wrap gap-2">
          {(
            [
              ["tracks", "Портфолио"],
              ["content", "Тексты"],
              ["links", "Ссылки"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                tab === id ? "bg-ink text-paper" : "border border-ink/10 text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
          {tab === "content" && (
            <div className="ml-auto flex gap-2">
              {(["ru", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={`px-3 py-2 text-[11px] uppercase tracking-[0.15em] ${
                    locale === l ? "text-accent" : "text-muted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {tab === "tracks" && (
          <div className="space-y-6">
            <p className="text-sm text-muted">
              Треки отображаются в портфолио и плеере внизу сайта. Загрузи mp3/wav и заполни жанр,
              инструменты и ссылки на площадки — это то, что видит клиент в карточке.
            </p>
            {data.tracks.map((track, i) => (
              <div key={track.id} className="border border-ink/10 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                      Название
                    </span>
                    <input
                      className="admin-input mt-1"
                      value={track.title}
                      onChange={(e) => updateTrack(i, { title: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                      Артист
                    </span>
                    <input
                      className="admin-input mt-1"
                      value={track.artist}
                      onChange={(e) => updateTrack(i, { artist: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                      Жанр
                    </span>
                    <input
                      className="admin-input mt-1"
                      placeholder="Indie pop"
                      value={track.genre ?? ""}
                      onChange={(e) => updateTrack(i, { genre: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                      Инструменты (через запятую)
                    </span>
                    <input
                      className="admin-input mt-1"
                      placeholder="FL Studio, Waves"
                      value={track.tools?.join(", ") ?? ""}
                      onChange={(e) =>
                        updateTrack(i, {
                          tools: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </label>
                </div>

                <p className="mt-4 truncate text-[12px] text-muted">
                  {track.src || "Файл не загружен"}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {PLATFORM_KEYS.map((key) => (
                    <label key={key} className="block">
                      <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                        {key} URL
                      </span>
                      <input
                        className="admin-input mt-1"
                        placeholder="https://..."
                        value={track.platforms?.[key] ?? ""}
                        onChange={(e) => updateTrackPlatform(i, key, e.target.value)}
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <label className="cursor-pointer border border-ink/15 px-3 py-2 text-[11px] uppercase tracking-[0.12em] hover:border-accent">
                    {uploading ? "…" : "Загрузить"}
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(f, i);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => moveTrack(i, -1)}
                    className="border border-ink/10 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-muted"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTrack(i, 1)}
                    className="border border-ink/10 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-muted"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTrack(i)}
                    className="border border-ink/10 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-accent"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setData((prev) =>
                  prev ? { ...prev, tracks: [...prev.tracks, emptyTrack()] } : prev,
                )
              }
              className="border border-dashed border-ink/20 px-4 py-3 text-[11px] uppercase tracking-[0.15em] text-muted hover:border-accent hover:text-accent"
            >
              + Добавить трек
            </button>
          </div>
        )}

        {tab === "content" && (
          <div className="space-y-10">
            <section>
              <h2 className="mb-4 font-display text-xl">Hero</h2>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  eyebrow
                </span>
                <input
                  className="admin-input mt-1"
                  value={c.hero.eyebrow}
                  onChange={(e) => patchLocale("hero.eyebrow", e.target.value)}
                />
              </label>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {(["line1", "line2", "line3"] as const).map((key) => (
                  <label key={key} className="block">
                    <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                      {key}
                    </span>
                    <input
                      className="admin-input mt-1"
                      value={c.hero[key]}
                      onChange={(e) => patchLocale(`hero.${key}`, e.target.value)}
                    />
                  </label>
                ))}
              </div>
              <label className="mt-4 block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  subheadline
                </span>
                <textarea
                  className="admin-textarea mt-1"
                  value={c.hero.subheadline}
                  onChange={(e) => patchLocale("hero.subheadline", e.target.value)}
                />
              </label>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                    CTA (основной)
                  </span>
                  <input
                    className="admin-input mt-1"
                    value={c.hero.ctaPrimary}
                    onChange={(e) => patchLocale("hero.ctaPrimary", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                    CTA (вторичный)
                  </span>
                  <input
                    className="admin-input mt-1"
                    value={c.hero.ctaSecondary}
                    onChange={(e) => patchLocale("hero.ctaSecondary", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                    status
                  </span>
                  <input
                    className="admin-input mt-1"
                    value={c.hero.status}
                    onChange={(e) => patchLocale("hero.status", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                    trust line
                  </span>
                  <input
                    className="admin-input mt-1"
                    value={c.hero.trust}
                    onChange={(e) => patchLocale("hero.trust", e.target.value)}
                  />
                </label>
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-display text-xl">About</h2>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  headline (\n для переноса)
                </span>
                <textarea
                  className="admin-textarea mt-1"
                  value={c.about.headline}
                  onChange={(e) => patchLocale("about.headline", e.target.value)}
                />
              </label>
              <label className="mt-4 block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  body
                </span>
                <textarea
                  className="admin-textarea mt-1"
                  value={c.about.body}
                  onChange={(e) => patchLocale("about.body", e.target.value)}
                />
              </label>
              <label className="mt-4 block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  ключевые пункты (по одному на строку)
                </span>
                <textarea
                  className="admin-textarea mt-1"
                  value={c.about.highlights.join("\n")}
                  onChange={(e) => patchLocaleList("about.highlights", e.target.value)}
                />
              </label>
            </section>

            <section>
              <h2 className="mb-4 font-display text-xl">Portfolio</h2>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  headline
                </span>
                <textarea
                  className="admin-textarea mt-1"
                  value={c.work.headline}
                  onChange={(e) => patchLocale("work.headline", e.target.value)}
                />
              </label>
              <label className="mt-4 block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  body
                </span>
                <textarea
                  className="admin-textarea mt-1"
                  value={c.work.body}
                  onChange={(e) => patchLocale("work.body", e.target.value)}
                />
              </label>
              <label className="mt-4 block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  услуги (по одной на строку)
                </span>
                <textarea
                  className="admin-textarea mt-1"
                  value={c.work.services.join("\n")}
                  onChange={(e) => patchLocaleList("work.services", e.target.value)}
                />
              </label>
            </section>

            <section>
              <h2 className="mb-4 font-display text-xl">Contact</h2>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  headline
                </span>
                <textarea
                  className="admin-textarea mt-1"
                  value={c.contact.headline}
                  onChange={(e) => patchLocale("contact.headline", e.target.value)}
                />
              </label>
              <label className="mt-4 block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  body
                </span>
                <textarea
                  className="admin-textarea mt-1"
                  value={c.contact.body}
                  onChange={(e) => patchLocale("contact.body", e.target.value)}
                />
              </label>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                    cta
                  </span>
                  <input
                    className="admin-input mt-1"
                    value={c.contact.cta}
                    onChange={(e) => patchLocale("contact.cta", e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                    cta subtitle
                  </span>
                  <input
                    className="admin-input mt-1"
                    value={c.contact.ctaSub}
                    onChange={(e) => patchLocale("contact.ctaSub", e.target.value)}
                  />
                </label>
              </div>
            </section>
          </div>
        )}

        {tab === "links" && (
          <div className="max-w-lg space-y-6">
            {(
              [
                ["telegram", "Telegram URL"],
                ["email", "Email mailto"],
                ["emailLabel", "Email label"],
                ["instagram", "Instagram URL"],
                ["soundcloud", "SoundCloud URL"],
                ["spotify", "Spotify URL"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">
                  {label}
                </span>
                <input
                  className="admin-input mt-1"
                  value={data.links[key] ?? ""}
                  onChange={(e) =>
                    setData({ ...data, links: { ...data.links, [key]: e.target.value } })
                  }
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
