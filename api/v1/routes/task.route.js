const express = require("express");
const router = express.Router();
const controller = require("../controllers/task.controller")   


router.get('/', controller.index);
router.get('/:id(\\w+)', controller.getTask); // Matches single ID
router.get('/:ids(\\w+(,\\w+)*)', controller.getTasks); // Matches comma-separated IDs


module.exports = router;








