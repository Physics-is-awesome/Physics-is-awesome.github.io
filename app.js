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
  const response = await fetch("schedule.json");
  const data = await response.json();
  const data = raw.nil;
  
  const state = loadState();
  const app = document.getElementById("app");

  data.forEach(({ category, items }) => {
    const section = document.createElement("section");
    section.className = "category";

    const header = document.createElement("h2");
    header.textContent = category;
    section.appendChild(header);

    items.forEach(text => {
      const id = taskId(category, text);
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
      label.textContent = text.trim();

      div.appendChild(checkbox);
      div.appendChild(label);
      section.appendChild(div);
    });

    app.appendChild(section);
  });
}

main();
