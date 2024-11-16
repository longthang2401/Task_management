const Task = require("../../../models/task.model");
const mongoose = require("mongoose");

module.exports.index = async (req, res) => {
  try {

    //find
    const objectFind = {
      deleted: false
    };
    if (req.query.status) {
      objectFind.status = { $in: req.query.status.split(',') };
    }
  
    //sort
    const sortField = req.query.sort || 'createdAt';
    const sortOrder= req.query.order === 'desc' ? -1 : 1; // 1 asc
    const sort = { [sortField]: sortOrder };

    //
    const tasks = await Task.find(objectFind).sort(sort);
    res.json(tasks);
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