const express = require("express");
const router = express.Router();
const controller = require("../controllers/task.controller")   


router.get('/', controller.index);
router.get('/:id(\\w+)', controller.getTask);
router.get('/:ids(\\w+(,\\w+)*)', controller.getTasks); 

router.patch("/update-fields", controller.updateFields);

router.post("/create-multi", controller.createTasks);
router.post("/create", controller.createTask);

router.delete("/:id", controller.softDeleteTask);
router.delete("/hard/:id", controller.hardDeleteTask);



module.exports = router;








