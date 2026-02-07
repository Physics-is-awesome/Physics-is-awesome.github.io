const STORAGE_KEY = "task-state";

function loadState() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function taskId(category, text) {
  return `${category}::${text.trim()}`;
}


async function main() {
  console.log("App starting");

  const response = await fetch("data/tasks.json");
  const raw = await response.json();

  console.log("RAW JSON:", raw);

  // ✅ THIS is the array you must iterate over
  const data = Object.values(raw).flat();

  console.log("NORMALIZED DATA:", data);
  console.log("Is array?", Array.isArray(data));

  if (!Array.isArray(data)) {
    throw new Error("Normalized data is not an array");
  }

  const state = loadState();
  const app = document.getElementById("app");

  data.forEach(({ category, items }) => {
    const section = document.createElement("section");
    section.className = "category";

    const header = document.createElement("h2");
    header.textContent = category;
    section.appendChild(header);

    items.forEach(text => {
      const cleanText = text.trim();
      const id = taskId(category, cleanText);
      const checked = !!state[id];

      const div = document.createElement("div");
      div.className = "task" + (checked ? " done" : "");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = checked;

      checkbox.addEventListener("change", () => {
        state[id] = checkbox.checked;
        saveState(state);
        div.classList.toggle("done", checkbox.checked);
      });

      const label = document.createElement("label");
      label.textContent = cleanText;

      div.appendChild(checkbox);
      div.appendChild(label);
      section.appendChild(div);
    });

    app.appendChild(section);
  });
}

main();

