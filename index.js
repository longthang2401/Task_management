const express = require("express");
const database = require("./config/DbConfig");
require("dotenv").config();

const reoutesApiVer1 = require("./api/v1/routes/index.route")



const app = express();
const port = process.env.PORT;

// Middleware để xử lý JSON
//app.use(express.json());


database.connect()
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Dừng ứng dụng nếu kết nối thất bại
  });


reoutesApiVer1(app);
// Khởi động server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
