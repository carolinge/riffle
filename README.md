<p align="center">
  <img src="build/icon-master.png" width="128" alt="Riffle icon" />
</p>

<p align="center">English | <a href="README.zh-CN.md">简体中文</a></p>

<h1 align="center">Riffle</h1>

<p align="center">
  <em>A featherweight macOS PDF reader built for riffling through research papers.</em><br/>
  The window is the page — every control stays hidden until your cursor comes looking for it.
</p>

![Reading view](docs/shot-reading.png)

## Why Riffle

Reading papers means constant jumping: to a reference, to a figure, to the next
section, back again. Most readers make you *commit* to every jump. Riffle lets
you **peek before you leap** — previews everywhere, jumps only when you click.

- **Page scrubber** — glide along the bottom ruler to riffle through the whole
  document like a flipbook, with chapter marks etched into the track and
  vermilion breadcrumbs remembering where you jumped from. Hover previews,
  click jumps.
- **Link peeks** — click an internal link (a citation, a figure reference) and
  a readable preview of the target floats up in place. Scroll and pinch inside
  it. Jump only if it's worth it.
- **Search built for papers** — hyphenated line-break words (`meth-` / `od`)
  match as one, diacritics are folded, missing spaces in the PDF text stream
  are tolerated. Results come with context snippets and a hover preview that
  pins a highlight band on the exact matching line.

![Search with hover preview](docs/shot-find.png)

## Reading modes

One, two, or three seamless columns — or a horizontal filmstrip where pages
sit edge to edge and the mouse wheel drives sideways. Pages fill the window
with no chrome; auto-trim shaves the white margins so content gets every pixel.

| Three columns + menu | Horizontal filmstrip |
|---|---|
| ![Modes](docs/shot-modes.png) | ![Horizontal](docs/shot-horizontal.png) |

## The scrubber

![Scrubber](docs/shot-scrubber.png)

## Everything else

- **Annotations** — a true highlighter (multiply blending, text stays crisp),
  five colors, draggable sticky notes, full **⌘Z / ⇧⌘Z undo-redo**. Notes you
  never typed into clean up after themselves.
- **Pointer-anchored zoom** — pinch to zoom around your cursor; re-renders
  sharpen only when the gesture rests. Fit-width / fit-height one-taps.
- **Table of contents** — slides in from the left edge on approach; the
  current chapter is marked as you read.
- **Multi-window** — every document gets its own window (⌘O multi-select,
  Finder, drag & drop).
- **Per-document memory** — view mode, zoom, trim, reading position, and
  annotations are all remembered per file.
- **Bilingual** — the UI follows your system language (English / 中文).
- Light & dark theme, proximity-revealed window controls, grab-to-pan on bare
  paper, reader keys (`←` `→` pages, space to scroll, `Home` / `End`).

## Install

Download the latest `Riffle-x.y.z-arm64.dmg` from
[Releases](../../releases), open it, and drag **Riffle** into Applications.

> **First launch** — Riffle isn't code-signed (no $99 Apple certificate), so
> macOS will warn you. Right-click the app → **Open** → **Open** once; after
> that it opens normally. Requires an Apple Silicon Mac.

## Build from source

```bash
npm install
npm start                # run in dev
./tools/build-local.sh   # package a DMG (the build runs on local disk)
```

Electron + [pdf.js](https://mozilla.github.io/pdf.js/). Design notes and the
full decision log live in [DESIGN.md](DESIGN.md) (中文).

## License

[MIT](LICENSE)
