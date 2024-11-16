const Task = require("../../../models/task.model");
const mongoose = require("mongoose");

module.exports.index = async (req, res) => {
  try {

    //Filter conditions
    const objectFind = {
      deleted: false
    };
    if (req.query.status) {
      objectFind.status = { $in: req.query.status.split(',') };
    }

    // Add search condition if search query is provided
    if (req.query.search) {
      const search = req.query.search;
      objectFind.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
  
    //sort
    const sortField = req.query.sort || 'createdAt';
    const sortOrder= req.query.order === 'desc' ? -1 : 1; // 1 asc
    const sort = { [sortField]: sortOrder };

    // Pagination
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
  
    // Fetch tasks with pagination and sorting
    const tasks = await Task.find(objectFind)
      .sort(sort)
      .skip(skip)
      .limit(limit);


     // Get the total number of tasks to calculate total pages
     const totalTasks = await Task.countDocuments(objectFind);
     const totalPages = Math.ceil(totalTasks / limit);
 
     // Send response with tasks and pagination info
     res.json({
       tasks,
       pagination: {
         currentPage: page,
         totalPages,
         totalTasks
       }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// multiple tasks by IDs
module.exports.getTasks = async (req, res) => {
  try {
    const ids = req.params.ids.split(',');

    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));

    if (invalidIds.length > 0 && validIds.length === 0) {
      return res.status(400).json({
        message: `Invalid ID(s): ${invalidIds.join(", ")}`
      });
    }
    const tasks = await Task.find({
      _id: { $in: validIds },
      deleted: false
    });

    if (tasks.length === 0 && validIds.length > 0) {
      return res.status(404).json({ message: "No tasks found for the given IDs" });
    }

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    // if (!res.headersSent) {
    //   res.status(500).json({ message: "Internal Server Error" });
    // }
  }
};

// Định nghĩa route GET /tasks/:id
module.exports.getTask = async (req, res) => {
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
}

//change status
module.exports.updateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or missing task IDs" });
    }
    if (!status) {
      return res.status(400).json({ message: "Missing status value" });
    }

    // Update tasks
    const result = await Task.updateMany(
      { _id: { $in: ids }, deleted: false }, 
      { $set: { status } }
    );

    res.json({
      message: "Task statuses updated successfully",
      matchedCount: result.matchedCount, 
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating task statuses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
