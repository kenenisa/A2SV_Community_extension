const express = require('express')
const cors = require('cors')
// const db = require('./models/db.js');


const app = express()
app.use(cors())
app.get('/', (req, res) => {
    res.send('OK')
})




app.set("port", process.env.PORT || 5000);
app.set("host", process.env.HOST || "localhost");

// db.sequelize.sync().then(function () {
  app.listen(app.get("port"), function () {
    console.log(
      "%s server listening at http://%s:%s",
      process.env.NODE_ENV,
      app.get("host"),
      app.get("port")
    );
  });
// })