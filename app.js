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
// Sets the default user (manager) to "Amir Azulay".

let employees = loadData(); 
// Loads employee data, either from localStorage or default data.

const navLinks = document.querySelectorAll(".nav-link"); 
// Selects all navigation link elements (for navigation menu).

const pages = document.querySelectorAll(".page"); 
// Selects all page elements (sections that can be shown/hidden).

const taskForm = document.getElementById("task-form"); 
// Selects the task form element (used to add new tasks).

const employeeSelect = document.getElementById("employee-select"); 
// Selects the employee dropdown (to choose an employee).

const myTasksContainer = document.getElementById("my-tasks"); 
// Selects the container for displaying the current user's tasks.

const overviewContainer = document.getElementById("employee-overview"); 
// Selects the container for displaying the employee overview.


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

// Adds event listeners for navigating between pages
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    pages.forEach(page => page.classList.add("hidden"));
    document.getElementById(`page-${link.dataset.page}`).classList.remove("hidden");
    if (link.dataset.page === '1') renderMyTasks(currentUser);
    if (link.dataset.page === '2') renderOverview();
    if (link.dataset.page === '3') populateEmployeeSelect();
  });
});

// Populates the employee dropdown with employee names for task assignment
function populateEmployeeSelect() {
  // Clears any existing options dropdown.
  employeeSelect.innerHTML = ''; 
  userSelector.innerHTML = ''; 
  // creating and appending an option for each employee to both the employeeSelect and userSelector dropdowns.
  for (const name in employees) {  
    const opt = document.createElement("option");  
    opt.value = name; 
    opt.textContent = name;
    employeeSelect.appendChild(opt); 

    const opt2 = opt.cloneNode(true);  
    userSelector.appendChild(opt2);
  }
  userSelector.value = currentUser;  // Sets the userSelector's value to the current user.
}

// Renders the tasks of the selected employee
function renderMyTasks(name) {
  const emp = employees[name];  // Gets the employee object for the selected user.
  myTasksContainer.innerHTML = ''; 
  emp.tasks.forEach((task, index) => {  // Loops through all tasks for the selected employee.
    const remaining = task.hours - (task.workedHours || 0);  // Calculates the remaining hours for the task.
    const taskDiv = document.createElement("div");  // Creates a new div for each task.
    taskDiv.className = "p-4 bg-white rounded shadow space-y-2";  // Adds styling to the task div.
    taskDiv.innerHTML = `
      <p class="font-bold">${task.title}</p>
      <p class="text-sm">${task.description}</p>
      <p class="text-xs text-gray-500">Progress: ${task.workedHours || 0} / ${task.hours} hours</p>
      <div class="flex space-x-2 items-center">
        <input type="number" class="update-hours w-20 p-1 border rounded" placeholder="+ Hours" min="0" max="${remaining}" data-index="${index}" />
        <button class="bg-blue-500 text-white px-2 py-1 rounded" data-index="${index}" onclick="updateProgress('${name}', ${index})">Update</button>
      </div>
    `;
    myTasksContainer.appendChild(taskDiv);  // Appends the task div to the container.
  });
}

// Updates the worked hours for a specific task
function updateProgress(name, index) {
  const input = document.querySelector(`.update-hours[data-index='${index}']`);  // Selects the input field for updating the task hours.
  let additional = parseFloat(input.value);  // Gets the value entered by the user to add hours.
  if (!additional || additional <= 0) return;  // If no valid value is entered, exit the function.

  const task = employees[name].tasks[index];  // Gets the specific task to update.
  const remaining = task.hours - (task.workedHours || 0);  // Calculates the remaining hours for the task.

  if (task.workedHours + additional > task.hours) {  // Ensures the total worked hours do not exceed the task hours.
    additional = remaining; // Adjusts the additional hours to prevent exceeding the task hours.
  }

  task.workedHours = (task.workedHours || 0) + additional;  // Updates the worked hours for the task.

  if (task.workedHours >= task.hours) {  // If the task is completed, move it to the completed tasks.
    employees[name].completedHours += task.hours;  // Adds the task's hours to the total completed hours.
    employees[name].tasks.splice(index, 1);  // Removes the task from the active tasks array.
  }

  input.value = '';  // Clears the input field after the update.
  saveData();  // Saves the updated data to localStorage.
  renderMyTasks(name);  // Re-renders the tasks for the current employee.
  renderOverview();  // Re-renders the overview for the updated data.
}

// Renders an overview of all employees, including their tasks progress
function renderOverview() {
  overviewContainer.innerHTML = '';  // Clears the current overview content.
  for (const name in employees) {  // Loops through each employee to render their data.
    const emp = employees[name];
    const partialProgress = emp.tasks.reduce((sum, t) => sum + (t.workedHours || 0), 0);  // Calculates the total worked hours from ongoing tasks.
    const totalWorked = emp.completedHours + partialProgress;  // Adds the completed hours to the total worked hours.
    const percent = emp.totalHours > 0 ? Math.round((totalWorked / emp.totalHours) * 100) : 0;  // Calculates the progress percentage.

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
    overviewContainer.appendChild(div);  // Appends the generated overview information to the container.
  }
}

// Handles the form submission to add a new task
taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("employee-select").value;
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-desc").value;
  const hours = parseFloat(document.getElementById("task-hours").value);

  const task = { title, description, hours, workedHours: 0 };  // Creates a new task object.
  employees[name].tasks.push(task);  // Adds the new task to the employee's tasks.
  employees[name].totalHours += hours;  // Adds the task hours to the employee's total hours.

  taskForm.reset(); 
  saveData();
  alert(`Task assigned to ${name}`);  // Shows a confirmation message.
  renderOverview();
});

// This function saves the current employees data and selected user to localStorage
function saveData() {
  localStorage.setItem('employeeData', JSON.stringify(employees));  // Saves the employees data.
  localStorage.setItem('currentUser', currentUser);  // Saves the current user.
}

// This function loads the data from localStorage
function loadData() {
  const saved = localStorage.getItem('employeeData');
  const user = localStorage.getItem('currentUser');
  if (user) currentUser = user;  // Updates the current user from localStorage if available.
  return saved ? JSON.parse(saved) : structuredClone(DEFAULT_EMPLOYEES);  // Loads employee data or uses the default data if none is found.
}

// Load initial page and render tasks for the current user
populateEmployeeSelect();
renderMyTasks(currentUser);
