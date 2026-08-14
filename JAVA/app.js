(() => {
  "use strict";

  const STORAGE_KEYS = {
    name: "daybreak_name",
    theme: "daybreak_theme",
    todos: "daybreak_todos",
    links: "daybreak_links",
    pomodoroLength: "daybreak_pomodoro_length",
  };

  const DEFAULT_LINKS = [
    { name: "Gmail", url: "https://mail.google.com" },
    { name: "Calendar", url: "https://calendar.google.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "Notion", url: "https://notion.so" },
  ];

  const $ = (id) => document.getElementById(id);

//    Greeting, clock, date, and the sun/moon arc         


  const greetingEl = $("greeting");
  const clockEl = $("clock");
  const dateEl = $("dateLine");
  const nameForm = $("nameForm");
  const nameInput = $("nameInput");
  const arcBody = $("arcBody");
  const arcPath = $("arcPath");

  function getPeriod(hour) {
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  function greetingWord(period) {
    switch (period) {
      case "morning": return "Good morning";
      case "afternoon": return "Good afternoon";
      case "evening": return "Good evening";
      default: return "Good night";
    }
  }

  function loadName() {
    return localStorage.getItem(STORAGE_KEYS.name) || "";
  }

  function updateGreetingText() {
    const now = new Date();
    const period = getPeriod(now.getHours());
    const name = loadName();
    greetingEl.textContent = name ? `${greetingWord(period)}, ${name}` : greetingWord(period);
    document.body.setAttribute("data-period", period);
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function updateClock() {
    const now = new Date();
    clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    dateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric",
    });
    updateSunArc(now);
  }

  // Moves the dot along the arc to reflect progress through the day (0–24h),
  // and swaps its color to match the current sky.
  function updateSunArc(now) {
    const totalLength = arcPath.getTotalLength();
    const hourFrac = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
    const point = arcPath.getPointAtLength(hourFrac * totalLength);
    arcBody.style.left = `${(point.x / 400) * 100}%`;
    arcBody.style.top = `${point.y - 8}px`;
  }

  function tickClock() {
    updateClock();
    updateGreetingText();
  }

  nameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEYS.name, nameInput.value.trim());
    updateGreetingText();
    nameInput.blur();
  });

  nameInput.value = loadName();


//    Theme toggle (light / dark / auto by time of day)                  

  const themeToggle = $("themeToggle");
  const themeIcon = $("themeIcon");

  function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "●" : theme === "light" ? "○" : "◐";
    themeToggle.title = `Theme: ${theme} (click to change)`;
  }

  function loadTheme() {
    return localStorage.getItem(STORAGE_KEYS.theme) || "auto";
  }

  let currentTheme = loadTheme();
  applyTheme(currentTheme);

  themeToggle.addEventListener("click", () => {
    const order = ["auto", "light", "dark"];
    currentTheme = order[(order.indexOf(currentTheme) + 1) % order.length];
    localStorage.setItem(STORAGE_KEYS.theme, currentTheme);
    applyTheme(currentTheme);
  });

//    Focus timer (Pomodoro)   

  const timerMinutesEl = $("timerMinutes");
  const timerSecondsEl = $("timerSeconds");
  const timerStatusEl = $("timerStatus");
  const startBtn = $("startBtn");
  const pauseBtn = $("pauseBtn");
  const resetBtn = $("resetBtn");
  const lengthInput = $("lengthInput");
  const lengthValue = $("lengthValue");

  let sessionMinutes = parseInt(localStorage.getItem(STORAGE_KEYS.pomodoroLength), 10) || 25;
  lengthInput.value = sessionMinutes;
  lengthValue.textContent = `${sessionMinutes} min`;

  let remainingSeconds = sessionMinutes * 60;
  let timerInterval = null;
  let isRunning = false;

  function renderTimer() {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    timerMinutesEl.textContent = pad(m);
    timerSecondsEl.textContent = pad(s);
  }

  function playChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (_) {  }
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    lengthInput.disabled = true;
    timerStatusEl.textContent = "Focusing…";
    timerInterval = setInterval(() => {
      remainingSeconds--;
      renderTimer();
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        lengthInput.disabled = false;
        timerStatusEl.textContent = "Session complete — nice work.";
        playChime();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    lengthInput.disabled = false;
    timerStatusEl.textContent = "Paused";
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = sessionMinutes * 60;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    lengthInput.disabled = false;
    timerStatusEl.textContent = "Ready when you are";
    renderTimer();
  }

  lengthInput.addEventListener("input", () => {
    sessionMinutes = parseInt(lengthInput.value, 10);
    lengthValue.textContent = `${sessionMinutes} min`;
    localStorage.setItem(STORAGE_KEYS.pomodoroLength, String(sessionMinutes));
    if (!isRunning) {
      remainingSeconds = sessionMinutes * 60;
      renderTimer();
    }
  });

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);

  renderTimer();

//    To-do list                                                          
 

  const todoForm = $("todoForm");
  const todoInput = $("todoInput");
  const todoList = $("todoList");
  const todoEmpty = $("todoEmpty");
  const todoCount = $("todoCount");
  const todoHint = $("todoHint");
  const clearDoneBtn = $("clearDoneBtn");

  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.todos)) || [];
    } catch (_) {
      return [];
    }
  }

  function saveTodos(todos) {
    localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
  }

  let todos = loadTodos();

  function showHint(message) {
    todoHint.textContent = message;
    if (message) setTimeout(() => { if (todoHint.textContent === message) todoHint.textContent = ""; }, 2500);
  }

  function renderTodos() {
    todoList.innerHTML = "";
    todoEmpty.style.display = todos.length ? "none" : "block";

    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.done ? " done" : "");
      li.dataset.id = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.done;
      checkbox.setAttribute("aria-label", `Mark "${todo.text}" as done`);
      checkbox.addEventListener("change", () => {
        todo.done = checkbox.checked;
        saveTodos(todos);
        renderTodos();
      });

      const text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = todo.text;
      text.contentEditable = "true";
      text.spellcheck = false;
      text.addEventListener("blur", () => {
        const newText = text.textContent.trim();
        if (!newText) { text.textContent = todo.text; return; }
        const isDuplicate = todos.some(
          (t) => t.id !== todo.id && t.text.toLowerCase() === newText.toLowerCase()
        );
        if (isDuplicate) {
          showHint("That task is already on your list.");
          text.textContent = todo.text;
          return;
        }
        todo.text = newText;
        saveTodos(todos);
      });
      text.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); text.blur(); }
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "icon-action";
      deleteBtn.innerHTML = "✕";
      deleteBtn.setAttribute("aria-label", `Delete "${todo.text}"`);
      deleteBtn.addEventListener("click", () => {
        todos = todos.filter((t) => t.id !== todo.id);
        saveTodos(todos);
        renderTodos();
      });

      li.append(checkbox, text, deleteBtn);
      todoList.appendChild(li);
    });

    const doneCount = todos.filter((t) => t.done).length;
    todoCount.textContent = `${todos.length} task${todos.length === 1 ? "" : "s"}` +
      (doneCount ? ` · ${doneCount} done` : "");
  }

  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    const isDuplicate = todos.some((t) => t.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
      showHint("That task is already on your list.");
      return;
    }

    todos.push({ id: Date.now().toString(36), text, done: false });
    saveTodos(todos);
    renderTodos();
    todoInput.value = "";
    todoInput.focus();
  });

  clearDoneBtn.addEventListener("click", () => {
    todos = todos.filter((t) => !t.done);
    saveTodos(todos);
    renderTodos();
  });

  renderTodos();

//    Quick links

  const linksGrid = $("linksGrid");
  const linkForm = $("linkForm");
  const linkName = $("linkName");
  const linkUrl = $("linkUrl");

  function loadLinks() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.links));
      return Array.isArray(stored) && stored.length ? stored : DEFAULT_LINKS;
    } catch (_) {
      return DEFAULT_LINKS;
    }
  }

  function saveLinks(links) {
    localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links));
  }

  let links = loadLinks();

  function normalizeUrl(url) {
    if (!/^https?:\/\//i.test(url)) return `https://${url}`;
    return url;
  }

  function renderLinks() {
    linksGrid.innerHTML = "";
    links.forEach((link, index) => {
      const a = document.createElement("a");
      a.className = "link-tile";
      a.href = normalizeUrl(link.url);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = link.name;

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-link";
      removeBtn.innerHTML = "✕";
      removeBtn.setAttribute("aria-label", `Remove ${link.name}`);
      removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        links = links.filter((_, i) => i !== index);
        saveLinks(links);
        renderLinks();
      });

      a.appendChild(removeBtn);
      linksGrid.appendChild(a);
    });
  }

  linkForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = linkName.value.trim();
    const url = linkUrl.value.trim();
    if (!name || !url) return;
    links.push({ name, url });
    saveLinks(links);
    renderLinks();
    linkName.value = "";
    linkUrl.value = "";
    linkName.focus();
  });

  renderLinks();

  tickClock();
  setInterval(tickClock, 1000);
})();