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

//update-fields
module.exports.updateFields = async (req, res) => {
  try {
    const { ids, key, value } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or missing 'ids'" });
    }
    if (!key || typeof key !== "string") {
      return res.status(400).json({ message: "Invalid or missing 'key'" });
    }

    // Cập nhật
    const updateData = { [key]: value };
    const result = await Task.updateMany(
      { _id: { $in: ids }, deleted: false }, // Điều kiện tìm
      { $set: updateData }                  // Dữ liệu cập nhật
    );

    // Phản hồi kết quả
    res.json({
      message: "Fields updated successfully",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      invalidIds: ids.length - result.matchedCount,
    });
  } catch (error) {
    console.error("Error updating fields:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//create 
module.exports.createTask = async (req, res) => {
  try {
    const { title, status, content, timeStart, timeFinish } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!title || !status || !content) {
      return res.status(400).json({ message: "Title, status, and content are required" });
    }

    // Tạo tài liệu mới
    const newTask = await Task.create({
      title,
      status,
      content,
      timeStart,
      timeFinish,
      deleted: false,
    });

    // Phản hồi kết quả
    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//create multil
module.exports.createTasks = async (req, res) => {
  try {
    const tasks = req.body.tasks;

    // Kiểm tra dữ liệu đầu vào
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ message: "Invalid or missing 'tasks' array" });
    }

    // Tạo nhiều tài liệu cùng lúc
    const createdTasks = await Task.insertMany(tasks);

    // Phản hồi kết quả
    res.status(201).json({
      message: "Tasks created successfully",
      tasks: createdTasks,
    });
  } catch (error) {
    console.error("Error creating tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


//delete
module.exports.softDeleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found or already deleted" });
    }

    res.json({
      message: "Task deleted successfully",
      task,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//delete-hard
module.exports.hardDeleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      message: "Task permanently deleted successfully",
      task,
    });
  } catch (error) {
    console.error("Error permanently deleting task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
