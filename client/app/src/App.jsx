import { useEffect, useState } from "react"; // State is a way for us to hold data that will manually trigger
// a re-render of the component when it changes
import Calendar from "./components/Calendar"; // Import the Calendar component 
import "./App.css";

function App() {
  useEffect(() => {
    // useEffect is a hook that allows us to run side effects in functional components
    fetchTodos();
  }, []); // empty array as last argument means that the effect will only run once (on render of webpage)

  // useState is a hook that allows us to add state to our functional components
  // useState returns an array with two elements: the current state value and a function that allows us to update the state value
  const [todos, setTodos] = useState([]);
  // state for each input field
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const fetchTodos = async () => {
    try {
      // make an api request to get all the todos
      const response = await fetch("http://localhost:8000/api/todos/"); // fetch is a built-in function that allows us to make network requests
      const data = await response.json(); // structuring the data in json format
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async () => {
    const todoData = {
      title, // when an object has a key and value with the same name, we can use shorthand syntax
      description,
      due_date: dueDate, // in the python code, the key is due_date, so we need to use the same key here
      start_time: startTime,
      end_time: endTime,
      completed: false,
    };
    try {
      const response = await fetch("http://localhost:8000/api/todos/", {
        method: "POST", // POST is used to send data to the server
        headers: {
          "Content-Type": "application/json", // Specifying the format of the data we are sending
        },
        body: JSON.stringify(todoData), // Converts a JavaScript object or value to a JSON string
      });
      const data = await response.json();
      setTodos((prevTodos) => [data, ...prevTodos]); // New todo added first, followed by previous entries
      // Clear form after successful addition
      setTitle("");
      setDescription("");
      setDueDate("");
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  /*
    toggleComplete function logic:
    1. Takes a todo object as parameter
    2. Makes a PUT request to update the todo's completed status
    3. Updates the local todos state by replacing the todo with the updated data
    4. Uses map to update only the specific todo while keeping others unchanged
    5. Logs any errors encountered during the update process
  */
  const toggleComplete = async (todo) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/todos/${todo.id}/`,
        {
          method: "PUT", // PUT is used to update data on the server
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...todo, completed: !todo.completed }),
        }
      );
      const data = await response.json();
      setTodos((prev) =>
        prev.map((t) => {
          if (t.id === todo.id) {
            // if the todo id matches the id of the todo we want to update, return updated data
            return data;
          } else {
            // otherwise, return the original todo
            return t;
          }
        })
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/todos/${id}/`, {
        method: "DELETE", // DELETE is used to delete data on the server
      });
      setTodos((prev) => prev.filter((todo) => todo.id !== id)); // filtering out the todo with the id that we want to delete
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  /*
    formatTodosForCalendar function logic:
    1. Maps over the todos array to format each todo for FullCalendar
    2. Converts the todo ID to a string for compatibility with FullCalendar
    3. Sets the title for the calendar event
    4. Combines the due date and start time into a single string for the start property
    5. Sets the end time if available
    6. Sets the background and border color to green if the todo is completed
    7. Returns the formatted array of todos
  */
  // Converts todo items into FullCalendar compatible event format
  const formatTodosForCalendar = () => {
    return todos.map(todo => ({
      id: todo.id.toString(),                    // Convert ID to string for FullCalendar
      title: todo.title,                         // Event title to display
      // Combine date and time, using 'T' as ISO-8601 separator
      start: `${todo.due_date}${todo.start_time ? 'T' + todo.start_time : ''}`,
      // Add end time if available
      end: todo.end_time ? `${todo.due_date}T${todo.end_time}` : undefined,
      // Use green color for completed todos
      backgroundColor: todo.completed ? 'green' : undefined,
      borderColor: todo.completed ? 'green' : undefined,
    }));
  };

  return (
    <>
      <h1>NovaTask</h1>
      
      {/* Calendar component for creating events that receives and displays the formatted todo events */}
      <Calendar events={formatTodosForCalendar()} />

      {/* Form for adding new todos */}
      <div className="todo-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>

      {todos.map((todo) => (
        <div key={todo.id}>
          <h2>Title: {todo.title}</h2>
          <p>Description: {todo.description}</p>
          <p>Date: {new Date(todo.due_date).toLocaleDateString()}</p>
          <p>
            Time: {todo.start_time} - {todo.end_time}
          </p>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleComplete(todo)}
          />
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
        </div>
      ))}
    </>
  );
}

export default App;
