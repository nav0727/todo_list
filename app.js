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

//having or Not in query

const havingPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const havingStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const havingStatusAndPriority = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

//get all TODO API

app.get("/todos/", async (request, response) => {
  let todoArray = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case havingStatusAndPriority(request.query):
      getTodoQuery = `
      SELECT
       * 
       FROM 
       todo
        WHERE todo LIKE '%${search_q}%' 
        AND status= '${status}' 
        AND priority='${priority}';`;
      break;
    case havingPriority(request.query):
      getTodoQuery = `
      SELECT 
      * 
      FROM
       todo
        WHERE 
        todo LIKE '%${search_q}%' 
        AND  priority='${priority}';`;
      break;
    case havingStatus(request.query):
      getTodoQuery = `
      SELECT
       *
         FROM 
       todo
        WHERE todo LIKE '%${search_q}%'
         AND status='${status}';`;
      break;
    default:
      getTodoQuery = `
      SELECT 
      * 
      FROM 
      todo
      WHERE
        todo LIKE '%${search_q}%';`;
  }

  todoArray = await database.all(getTodoQuery);
  response.send(todoArray);
});

// get Id by Todo API

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
  SELECT 
  *
   FROM 
   todo 
   WHERE id=${todoId};`;
  const todoSingle = await database.get(getTodoQuery);
  response.send(todoSingle);
});

// Post Create todo API

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
   todo(id,todo,priority,status)
    VALUES (${id},'${todo}','${priority}','${status}');`;
  await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

// Update put API

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updatedValue = "";
  const requestBodyValue = request.body;
  switch (true) {
    case requestBodyValue.status !== undefined:
      updatedValue = "Status";
      break;
    case requestBodyValue.priority !== undefined:
      updatedValue = "Priority";
      break;
    case requestBodyValue.todo !== undefined:
      updatedValue = "Todo";
      break;
  }
  const updateBeforeTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const beforeTodo = await database.get(updateBeforeTodoQuery);

  const {
    todo = beforeTodo.todo,
    priority = beforeTodo.priority,
    status = beforeTodo.status,
  } = request.body;

  const UpdateTodoQuery = `
    UPDATE
    todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

  await database.run(UpdateTodoQuery);
  response.send(`${updatedValue} Updated`);
});

// delete todo by Id API

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
