const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());

let database = null;

const InitializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost/3000/")
    );
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};
InitializeDbAndServer();

//convert DBObj  to Res Obj

const convertDbToResObj = (dbObj) => {
  return {
    id: dbObj.id,
    todo: dbObj.todo,
    priority: dbObj.priority,
    status: dbObj.status,
  };
};

//get all TODO API

app.get("/todos/", async (request, response) => {
  const getQuery = `SELECT * FROM todo;`;
  const todoArray = await database.all(getQuery);
  response.send(todoArray.map((each) => convertDbToResObj(each)));
});

module.exports = app;
