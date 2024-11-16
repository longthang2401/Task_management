const express = require("express");
const router = express.Router();
//const controller = require("../../controllers/client/task.controller")   

//router.get('/', controller.index);

const Task = require("../../../models/task.model");

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ deleted: false });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});





// multiple tasks by IDs
router.get("/", async (req, res) => {
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



// Định nghĩa route GET /tasks/:id
router.get("/:id", async (req, res) => {
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



module.exports = router;








