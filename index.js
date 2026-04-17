const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 📂 Read tasks from file
const getTasks = () => {
  const data = fs.readFileSync('tasks.json', 'utf8');
  return JSON.parse(data || '[]');
};

// 💾 Save tasks to file
const saveTasks = (tasks) => {
  fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
};

// =======================
// 📥 GET ALL TASKS
// =======================
app.get('/tasks', (req, res) => {
  const tasks = getTasks();
  res.json(tasks);
});

// =======================
// 📥 GET TASK BY ID
// =======================
app.get('/tasks/:id', (req, res) => {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === parseInt(req.params.id));

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

// =======================
// ➕ CREATE TASK
// =======================
app.post('/tasks', (req, res) => {
  const tasks = getTasks();
  const { title, description, status, priority, dueDate } = req.body;

  if (!title || !status || !priority) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    title,
    description: description || '',
    status,
    priority,
    dueDate: dueDate || '',
  };

  tasks.push(newTask);
  saveTasks(tasks);

  res.status(201).json({
    message: 'Task created successfully',
    task: newTask,
  });
});

// =======================
// ✏️ UPDATE TASK
// =======================
app.put('/tasks/:id', (req, res) => {
  const tasks = getTasks();
  const id = parseInt(req.params.id);

  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[index] = {
    ...tasks[index],
    ...req.body,
  };

  saveTasks(tasks);

  res.json({
    message: 'Task updated successfully',
    task: tasks[index],
  });
});

// =======================
// ❌ DELETE TASK
// =======================
app.delete('/tasks/:id', (req, res) => {
  let tasks = getTasks();
  const id = parseInt(req.params.id);

  const filtered = tasks.filter((t) => t.id !== id);

  if (tasks.length === filtered.length) {
    return res.status(404).json({ error: 'Task not found' });
  }

  saveTasks(filtered);

  res.json({ message: 'Task deleted successfully' });
});

// =======================
// 🏠 HOME ROUTE
// =======================
app.get('/', (req, res) => {
  res.json({
    message: 'Task Management API is running 🚀',
  });
});

// =======================
// 🚀 START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
