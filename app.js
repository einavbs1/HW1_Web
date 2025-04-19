// Employees with tasks: (Fake data)
const DEFAULT_EMPLOYEES = {
  'Amir Azulay': { tasks: [{ title: 'Task 1', description: 'Fake task 1', hours: 5, workedHours: 2 },{ title: 'Task 2', description: 'Fake task 2', hours: 12, workedHours: 4 }], completedHours: 0, totalHours: 17 },
  'Chen Tzafir': { tasks: [{ title: 'Task 3', description: 'Fake task 3', hours: 7, workedHours: 4 },{ title: 'Task 4', description: 'Fake task 4', hours: 2, workedHours: 2 }], completedHours: 0, totalHours: 9 },
  'Rafael Kipershlak': { tasks: [{ title: 'Task 5', description: 'Fake task 5', hours: 10, workedHours: 0 },{ title: 'Task 6', description: 'Fake task 6', hours: 2, workedHours: 1 }], completedHours: 0, totalHours: 12 },
  'Avishag Levi': { tasks: [{ title: 'Task 7', description: 'Fake task 7', hours: 8, workedHours: 5 },{ title: 'Task 8', description: 'Fake task 8', hours: 20, workedHours: 18 }], completedHours: 0, totalHours: 28 },
  'Yuval Lerfeld': { tasks: [{ title: 'Task 9', description: 'Fake task 9', hours: 11, workedHours: 4 },{ title: 'Task 10', description: 'Fake task 10', hours: 7, workedHours: 7 }], completedHours: 0, totalHours: 18 },
  'Einav Ben Shushan': { tasks: [{ title: 'Task 11', description: 'Fake task 11', hours: 13, workedHours: 7 },{ title: 'Task 12', description: 'Fake task 12', hours: 7, workedHours: 4 }], completedHours: 0, totalHours: 20 },
};
  
  let currentUser = 'Amir Azulay';
  let employees = loadData(); // Default user is the manager
  
  const navLinks = document.querySelectorAll(".nav-link");
  const pages = document.querySelectorAll(".page");
  const taskForm = document.getElementById("task-form");
  const employeeSelect = document.getElementById("employee-select");
  const myTasksContainer = document.getElementById("my-tasks");
  const overviewContainer = document.getElementById("employee-overview");
  
  // Add user selector for personal task switching
  const userSelector = document.createElement("select");
  userSelector.className = "mb-4 p-2 border rounded";
  userSelector.id = "user-selector";
  document.getElementById("page-1").prepend(userSelector);
  
  userSelector.addEventListener("change", () => {
    currentUser = userSelector.value;
    saveData();
    renderMyTasks(currentUser);
  });
  
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      pages.forEach(page => page.classList.add("hidden"));
      document.getElementById(`page-${link.dataset.page}`).classList.remove("hidden");
      if (link.dataset.page === '1') renderMyTasks(currentUser);
      if (link.dataset.page === '2') renderOverview();
      if (link.dataset.page === '3') populateEmployeeSelect();
    });
  });
  
  function populateEmployeeSelect() {
    employeeSelect.innerHTML = '';
    userSelector.innerHTML = '';
    for (const name in employees) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      employeeSelect.appendChild(opt);
  
      const opt2 = opt.cloneNode(true);
      userSelector.appendChild(opt2);
    }
    userSelector.value = currentUser;
  }
  
  function renderMyTasks(name) {
    const emp = employees[name];
    myTasksContainer.innerHTML = '';
    emp.tasks.forEach((task, index) => {
      const remaining = task.hours - (task.workedHours || 0);
      const taskDiv = document.createElement("div");
      taskDiv.className = "p-4 bg-white rounded shadow space-y-2";
      taskDiv.innerHTML = `
        <p class="font-bold">${task.title}</p>
        <p class="text-sm">${task.description}</p>
        <p class="text-xs text-gray-500">Progress: ${task.workedHours || 0} / ${task.hours} hours</p>
        <div class="flex space-x-2 items-center">
          <input type="number" class="update-hours w-20 p-1 border rounded" placeholder="+ Hours" min="0" max="${remaining}" data-index="${index}" />
          <button class="bg-blue-500 text-white px-2 py-1 rounded" data-index="${index}" onclick="updateProgress('${name}', ${index})">Update</button>
        </div>
      `;
      myTasksContainer.appendChild(taskDiv);
    });
  }
  
  function updateProgress(name, index) {
    const input = document.querySelector(`.update-hours[data-index='${index}']`);
    let additional = parseFloat(input.value);
    if (!additional || additional <= 0) return;
  
    const task = employees[name].tasks[index];
    const remaining = task.hours - (task.workedHours || 0);
  
    if (task.workedHours + additional > task.hours) {
      additional = remaining; // Strict check to avoid overage
    }
  
    task.workedHours = (task.workedHours || 0) + additional;
  
    if (task.workedHours >= task.hours) {
      employees[name].completedHours += task.hours;
      employees[name].tasks.splice(index, 1);
      
    }
  
    input.value = ''; // Clear input after update
    saveData();
    renderMyTasks(name);
    renderOverview();
  }
  
  function renderOverview() {
    overviewContainer.innerHTML = '';
    for (const name in employees) {
      const emp = employees[name];
      const partialProgress = emp.tasks.reduce((sum, t) => sum + (t.workedHours || 0), 0);
      const totalWorked = emp.completedHours + partialProgress;
      const percent = emp.totalHours > 0 ? Math.round((totalWorked / emp.totalHours) * 100) : 0;
  
      const div = document.createElement("div");
      div.className = "p-4 bg-white rounded shadow";
      div.innerHTML = `
        <h2 class="text-lg font-bold mb-2">${name}</h2>
        <div class="bg-gray-200 h-4 w-full rounded mb-2">
          <div class="bg-blue-600 h-4 rounded" style="width: ${percent}%"></div>
        </div>
        <p>Total Tasks: ${emp.tasks.length}</p>
        <p>Completed Hours: ${totalWorked} / ${emp.totalHours}</p>
        ${emp.tasks.map(t => `<div class='text-sm mt-1 border-t pt-1'><b>${t.title}</b>: ${t.description} - ${t.workedHours || 0}/${t.hours} hrs</div>`).join('')}
      `;
      overviewContainer.appendChild(div);
    }
  }
  
  taskForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("employee-select").value;
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-desc").value;
    const hours = parseFloat(document.getElementById("task-hours").value);
  
    const task = { title, description, hours, workedHours: 0 };
    employees[name].tasks.push(task);
    employees[name].totalHours += hours;
  
    taskForm.reset();
    saveData();
    alert(`Task assigned to ${name}`);
    renderOverview();
  });
  
  function saveData() {
    localStorage.setItem('employeeData', JSON.stringify(employees));
    localStorage.setItem('currentUser', currentUser);
  }
  
  function loadData() {
    const saved = localStorage.getItem('employeeData');
    const user = localStorage.getItem('currentUser');
    if (user) currentUser = user;
    return saved ? JSON.parse(saved) : structuredClone(DEFAULT_EMPLOYEES);
  }
  
  // Load initial page
  populateEmployeeSelect();
  renderMyTasks(currentUser);
  
  
