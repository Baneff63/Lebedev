# Откат к версии сайта до патча со скроллящейся главной

Этот архив возвращает всё как было до патча «скроллящаяся главная + плеер
по требованию + осциллограф в скролл-истории».

## Шаг 1 — распакуй архив поверх проекта

Все файлы внутри — это оригинальные версии, подтверди замену.

## Шаг 2 — удали файлы, которых не было до патча

Эти файлы архив НЕ содержит (их нечем «вернуть», их просто не было) —
удали их вручную:

```
src/lib/signalScopeScrollMode.ts
src/lib/gsapScrollTrigger.ts
src/components/effects/HomeSignalScopeController.tsx
src/components/sections/HomeStats.tsx
src/components/sections/HomePortfolioTeaser.tsx
src/components/sections/HomeFinale.tsx
```

## Что содержит архив (восстановленные оригиналы)

- `src/context/PlayerContext.tsx`
- `src/components/player/FixedPlayer.tsx`
- `src/components/effects/GlobalSignalScope.tsx`
- `src/components/effects/GlobalEffects.tsx`
- `src/components/ui/StatCounter.tsx`
- `src/components/sections/HomeHero.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`

## Дальше

```bash
npm run build
npm run lint
```

Если пользуешься git — это самый надёжный способ отката, вместо ручной
распаковки: `git log --oneline` и `git revert`/`git reset --hard` на
коммит до применения патча, если ты его коммитил перед тем как накатывать
изменения. Этот zip — на случай, если git не задействован или изменения
уже смешались с другими правками.
