# CodingCamp-10August26-Zhafir

# Daybreak — To-Do List Life Dashboard

A single-page dashboard for organizing your day: live greeting and clock, a
25-minute focus timer, a to-do list, and quick links — all saved locally in
your browser. No backend, no accounts, no build step.

## Design note
The background sky and the small dot arcing overhead shift with the actual
time of day (morning → afternoon → evening → night), tying the greeting
feature and the visual design together. A separate light/dark toggle
overrides this for anyone who just wants one consistent look.

## Tech stack
- `index.html` — structure
- `CSS/style.css` — all styling (one file)
- `JAVA/app.js` — all behavior (one file, vanilla JS, no frameworks)
- Data storage: `localStorage` only, client-side

## Features
- **Greeting** — live clock, date, and a greeting that changes with the time
  of day; optional custom name saved locally.
- **Focus Timer** — start / pause / reset, adjustable session length
  (5–60 min) saved locally, soft chime on completion.
- **To-Do List** — add, inline-edit, mark done, delete; duplicate tasks are
  blocked; everything persists in `localStorage`.
- **Quick Links** — a small default set plus the ability to add or remove
  your own; saved in `localStorage`; opens in a new tab.

### Challenges implemented (3 of 5)
1. **Light / dark mode** — toggle in the top right (auto → light → dark).
2. **Custom name in greeting** — type a name once, it's remembered.
3. **Change Pomodoro time** — slider adjusts the timer's session length.

## Running it locally
No build step needed. Just open `index.html` in a browser, or serve the
folder with any static server, e.g.:



## Deploying with GitHub Pages
1. Create a new repository and add these files (`index.html`, `css/`, `js/`)
   at the repo root.
2. Open **GitHub Desktop**, add this folder as a local repository, commit,
   and push to GitHub.
3. On GitHub.com, go to **Settings → Pages**.
4. Under **Source**, choose the `main` branch and `/ (root)` folder, then
   save.
5. GitHub will publish the site at
   `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Folder structure
```
.
├── index.html
├── CSS/
│   └── style.css
├── JAVA/
│   └── app.js
└── README.md
```