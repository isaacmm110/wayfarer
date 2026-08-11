# Wayfarer

Premium travel discovery, presented as a cinematic world control room.

## Repository structure

```text
apps/
  world-map/  Interactive Next.js globe experience
  guides/     Reserved for the guides app
packages/
  database/   Reserved for shared database code
```

This repository uses npm workspaces. The root scripts currently target the
`@wayfarer/world-map` app.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
