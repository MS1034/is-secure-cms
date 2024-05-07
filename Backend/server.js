const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cron = require('node-cron');
const path = require("path");
const session = require('express-session');
const sessionMiddleware = require("./Middlewares/Session/sessionMiddleware");

const IndexRoute = require("./Routers/index");
const connectDatabase = require("./Helpers/database/connectDatabase");
const customErrorHandler = require("./Middlewares/Errors/customErrorHandler");
const securityMiddleware = require("./Middlewares/Security Headers/securityMiddleware");
const {backup, deleteOldBackups,restore} = require("./Helpers/database/backup");
// dotenv.config({
//     path:  './Config/config.env'
// })
dotenv.config();

connectDatabase();

const app = express();

app.use(express.json());
app.use(cors());

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true,
    maxAge: 1* 1* 30 * 1000, 
  },
}));

// app.use((req,res,next) => {
//   console.log(req.session);
//   next();
// })

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.use("/", IndexRoute);

app.use(securityMiddleware());
app.use(customErrorHandler);

const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "public")));


cron.schedule('0 0 * * *', () => {
backup();
deleteOldBackups();
});


// cron.schedule('0 1 * * 0', () => {
//   restore();
// });

// let a=true
// if(a){
//   backup()
//   restore();
//   a=false
// }


const server = app.listen(PORT, () => {
  console.log(`Server running on port  ${PORT} : ${process.env.NODE_ENV}`);
});


process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error : ${err}`);

  server.close(() => process.exit(1));
});
