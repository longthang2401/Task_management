const taskRouter = require("./task.routes")
const authRouter = require("./auth.routes")

module.exports = (app) =>{
    const version = `/api/v1`;
    app.use(`${version}/tasks`, taskRouter);
    app.use(`${version}/auth`, authRouter);
 
}
      


  