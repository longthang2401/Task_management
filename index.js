const express = require("express");
const database = require("./config/DbConfig");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

// Middleware để xử lý JSON
//app.use(express.json());

// Kết nối đến cơ sở dữ liệu
database.connect()
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Dừng ứng dụng nếu kết nối thất bại
  });

const Task = require("./models/task.model");


// multiple tasks by IDs
app.get("/tasks", async (req, res) => {
  try {
    const ids = req.query.ids?.split(",") || [];
    console.log(ids)
    if (ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const tasks = await Task.find({
      _id: { $in: ids },
      deleted: false
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for the given IDs" });
    }

    res.json(tasks); 
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});



// Định nghĩa route GET /tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({ deleted: false });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Định nghĩa route GET /tasks/:id
app.get("/tasks/:id", async (req, res) => {
  try {
    const id = req.params.id; 
    const task = await Task.findOne({ 
      _id: id, 
      deleted: false 
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" }); 
    }

    res.json(task); 
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" }); 
  }
});




// Khởi động server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
