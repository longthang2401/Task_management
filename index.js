const express = require("express");
//const bodyParser = require("body-parser")
const cors = require("cors");
const database = require("./config/DbConfig");
require("dotenv").config();

const reoutesApiVer1 = require("./api/v1/routes/index.routes")



const app = express();
const port = process.env.PORT;


app.use(cors());
// Middleware để xử lý JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
