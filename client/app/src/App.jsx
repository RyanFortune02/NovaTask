import { useEffect, useState } from "react"; // State is a way for us to hold data that will manually trigger
// a re-render of the component when it changes
import Calendar from "./components/Calendar"; // Import the Calendar component
import "./App.css";

// External link button component
// This component is used to create a button that opens an external link in a new tab
// It takes a URL and children (text or elements to display inside the button)
const ExternalButtonLink = ({ url, children }) => {
  return (
    <button
      className="external-button"
      onClick={() => window.open(url, "_blank")}
      type="button" // Add type to avoid form submission
    >
      {children}
    </button>
  );
};

// Function to calculate how long the event lasts in hours
const getHoursDifference = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return endHour - startHour + (endMinute - startMinute) / 60;
};

// FormatDuation function logic:
// 1. Takes start and end time as parameters
// 2. If either time is not provided, return null
// 3. Calculate the total hours difference using getHoursDifference function
// 4. Calculate hours and minutes from the total hours
// 5. Return formatted string based on hours and minutes
const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;

  const totalHours = getHoursDifference(startTime, endTime); // Calls the helper function to get the difference in hour
  const hours = Math.floor(totalHours); // Math.floor() rounds down to the nearest whole number
  const minutes = Math.round((totalHours - hours) * 60); // Math.round() rounds to the nearest whole number

  // Format the duration string based on hours and minutes
  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${
    minutes !== 1 ? "s" : ""
  }`;
};

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
  const [todoType, setTodoType] = useState("TODO");
  const [repeatType, setRepeatType] = useState("N");
  const [repeatFrequency, setRepeatFrequency] = useState(1); // For repeat frequency
  const [notifyTime, setNotifyTime] = useState(""); // For notification time
  const [repeatDays, setRepeatDays] = useState(0); // Bitmask for selected days
  const [repeatEndDate, setRepeatEndDate] = useState(""); // Stop date for repeat events
  const [showForm, setShowForm] = useState(false); // State to control the visibility of the form

  // Constants for todo types that match backend model
  const TODO_TYPES = {
    TODO: "TODO", // Regular todo item
    CLASS: "CLASS", // Class schedule item
  };

  // Constants for repeat types that match backend model
  const REPEAT_TYPES = {
    NEVER: "N",
    WEEKS: "W",
    MONTHS: "M",
    YEARS: "Y",
  };

  // Bitmask constants for days of week
  const REPEAT_DAYS = {
    SUNDAY: 0b1000000,
    MONDAY: 0b0100000,
    TUESDAY: 0b0010000,
    WEDNESDAY: 0b0001000,
    THURSDAY: 0b0000100,
    FRIDAY: 0b0000010,
    SATURDAY: 0b0000001,
  };

  /*
  Convert ToDo type from all caps to a more readable format.
  */
  const formatTodoType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(); // Capitalize first letter and lowercase the rest
  };

  const fetchTodos = async () => {
    try {
      // make an api request to get all the todos
      const response = await fetch(
        "https://ryanfortune.pythonanywhere.com/api/todos/"
      ); // fetch is a built-in function that allows us to make network requests
      const data = await response.json(); // structuring the data in json format
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // This function takes a dayMask (bitmask) and toggles the corresponding bit in repeatDays
  const toggleDay = (dayMask) => {
    setRepeatDays((prevDays) => prevDays ^ dayMask); // Uses XOR operation to toggle the bit
  };

  const addTodo = async () => {
    // Create notification datetime by combining due date and notify time
    let notifyDateTime = null;
    if (dueDate && notifyTime) {
      notifyDateTime = `${dueDate}T${notifyTime}:00`;
    }

    // If repeat end date is not provided, set it to null
    // If repeat end date is provided, set it to the end of the day
    let repeatEndDateTime = null;
    if (repeatEndDate) {
      repeatEndDateTime = `${repeatEndDate}T23:59:59`;
    }

    const todoData = {
      title, // when an object has a key and value with the same name, we can use shorthand syntax
      description,
      due_date: dueDate, // in the python code, the key is due_date, so we need to use the same key here
      start_time: startTime,
      end_time: endTime,
      completed: false,
      todo_type: todoType, // Add todo_type to the request
      repeat_type: repeatType,
      repeat_frequency: repeatFrequency,
      notify_time: notifyDateTime, // Add notify_time to the request
      delivered: false,
      repeat_days: repeatDays, // Add repeat_days to request
      repeat_end_time: repeatEndDateTime,
    };
    try {
      const response = await fetch(
        "https://ryanfortune.pythonanywhere.com/api/todos/",
        {
          method: "POST", // POST is used to send data to the server
          headers: {
            "Content-Type": "application/json", // Specifying the format of the data we are sending
          },
          body: JSON.stringify(todoData), // Converts a JavaScript object or value to a JSON string
        }
      );
      const data = await response.json();
      setTodos((prevTodos) => [data, ...prevTodos]); // New todo added first, followed by previous entries
      // Clear form after successful addition
      setTitle("");
      setDescription("");
      setDueDate("");
      setStartTime("");
      setEndTime("");
      setRepeatEndDate(""); // Clear repeat end date after successful addition
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
        `https://ryanfortune.pythonanywhere.com/api/todos/${todo.id}/`,
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
      await fetch(`https://ryanfortune.pythonanywhere.com/api/todos/${id}/`, {
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
  // Helper function to convert the repeat_days bitmask into an array of day indices.
  // If bitmask is 0 or falsy, assume the event repeats every day.
  function getRepeatDaysArray(bitmask) {
    if (!bitmask) return [0, 1, 2, 3, 4, 5, 6];
    const days = [];
    if (bitmask & 0b1000000) days.push(0); //Sunday
    if (bitmask & 0b0100000) days.push(1); //Monday
    if (bitmask & 0b0010000) days.push(2); //Tuesday
    if (bitmask & 0b0001000) days.push(3); //Wednesday
    if (bitmask & 0b0000100) days.push(4); //Thursday
    if (bitmask & 0b0000010) days.push(5); //Friday
    if (bitmask & 0b0000001) days.push(6); //Saturday
    return days;
  }

  // Converts todo items into FullCalendar compatible event format,
  // and includes a new property `repeatDays` based on the todo's `repeat_days` bitmask.
  const formatTodosForCalendar = () => {
    return todos.map((todo) => {
      // Create a base event object with common properties
      const baseEvent = {
        id: todo.id.toString(), // Convert ID to string for FullCalendar
        title: todo.title, // Event title to display
        // Use green color for completed todos
        backgroundColor: todo.completed ? "green" : undefined,
        borderColor: todo.completed ? "green" : undefined,
      };

      // If this is not a recurring event, return simple event format
      if (todo.repeat_type === "N") {
        return {
          // For non-recurring events, use the base event object
          ...baseEvent,
          // Set the start date and time
          // Combine date and time into a single string for start property
          start: `${todo.due_date}${
            todo.start_time ? "T" + todo.start_time : ""
          }`,
          end: todo.end_time ? `${todo.due_date}T${todo.end_time}` : undefined, // Add end time if available
        };
      }

      // For recurring events, create RRule format
      // Map the repeat_type to FullCalendar's RRule frequency
      const rruleFreq = {
        W: "WEEKLY",
        M: "MONTHLY",
        Y: "YEARLY",
      }[todo.repeat_type];

      // convert repeat_days bitmask into an array of day indices.
      // If bitmask is 0 or falsy, assume the event repeats every day.
      const byWeekDay = getRepeatDaysArray(todo.repeat_days).map((day) => {
        return ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][day];
      });

      let ruleObject = {
        freq: rruleFreq, // Frequency of the event (weekly, monthly, yearly)
        interval: todo.repeat_frequency, // Interval for the frequency (e.g., every 2 weeks)
        dtstart: `${todo.due_date}${
          todo.start_time ? "T" + todo.start_time : ""
        }`, // Start date and time of the event
        until: todo.repeat_end_time, // End date and time of the event
      };

      if (todo.repeat_type == REPEAT_TYPES.WEEKS) {
        ruleObject.byweekday = byWeekDay; // Days of the week on which the event occurs
      }

      return {
        ...baseEvent,
        rrule: ruleObject,
        duration:
          todo.end_time && todo.start_time
            ? {
                hours: getHoursDifference(todo.start_time, todo.end_time),
              }
            : undefined,
      };
    });
  };

  // Add toggle function to show/hide the Todo form
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <>
      <h1>NovaTask</h1>

      <ExternalButtonLink url="https://novoconnect.ncf.edu">
        NovoConnect
      </ExternalButtonLink>

      {/* Calendar component for creating events that receives and displays the formatted todo events */}
      <Calendar events={formatTodosForCalendar()} />

      {/* Button to toggle the visibility of the form */}
      <button className="toggle-form-button" onClick={toggleForm}>
        {showForm ? "Hide Todo Form" : "Add New Todo/Class"}
      </button>

      {/* Form container Modified  with conditional rendering to display TODO Form */}
      {/* The form is only visible when showForm is true */}
      <div className={`form-container ${showForm ? "visible" : "hidden"}`}>
        {/* Form for adding new todos */}
        <div className="todo-form">
          {/* Dropdown menu to select ToDo type */}
          <select
            value={todoType}
            onChange={(e) => setTodoType(e.target.value)}
          >
            <option value={TODO_TYPES.TODO}>Todo</option>
            <option value={TODO_TYPES.CLASS}>Class</option>
          </select>

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
          <div className="form-row">
            <label>Date:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Start Time:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>End Time:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Repeat:</label>
            <select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value)}
              className="repeat-select"
            >
              <option value={REPEAT_TYPES.NEVER}>Don't repeat</option>
              <option value={REPEAT_TYPES.WEEKS}>Weekly</option>
              <option value={REPEAT_TYPES.MONTHS}>Monthly</option>
              <option value={REPEAT_TYPES.YEARS}>Yearly</option>
            </select>
          </div>

          {repeatType !== REPEAT_TYPES.NEVER && (
            <>
              <div className="form-row">
                <label>Every:</label>
                <select
                  value={repeatFrequency}
                  onChange={(e) => setRepeatFrequency(Number(e.target.value))}
                  className="frequency-select"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <span className="frequency-label">
                  {repeatType === REPEAT_TYPES.WEEKS
                    ? "weeks"
                    : repeatType === REPEAT_TYPES.MONTHS
                    ? "months"
                    : repeatType === REPEAT_TYPES.YEARS
                    ? "years"
                    : ""}
                </span>
              </div>
              <div className="form-row">
                <label>Repeat on:</label>
                <div className="days-selector">
                  {[
                    { name: "S", mask: REPEAT_DAYS.SUNDAY },
                    { name: "M", mask: REPEAT_DAYS.MONDAY },
                    { name: "T", mask: REPEAT_DAYS.TUESDAY },
                    { name: "W", mask: REPEAT_DAYS.WEDNESDAY },
                    { name: "T", mask: REPEAT_DAYS.THURSDAY },
                    { name: "F", mask: REPEAT_DAYS.FRIDAY },
                    { name: "S", mask: REPEAT_DAYS.SATURDAY },
                  ].map((day) => (
                    <button
                      key={day.mask}
                      type="button"
                      className={`day-button ${
                        repeatDays & day.mask ? "selected" : ""
                      }`}
                      onClick={() => toggleDay(day.mask)}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <label>Until:</label>
                <input
                  type="date"
                  value={repeatEndDate}
                  onChange={(e) => setRepeatEndDate(e.target.value)}
                  min={dueDate} // Ensure repeat end date is not before the due date
                  className="repeat-end-date"
                />
              </div>
            </>
          )}
          <div className="form-row">
            <label>Notify at:</label>
            <input
              type="time"
              value={notifyTime}
              onChange={(e) => setNotifyTime(e.target.value)}
              placeholder="Select notification time"
            />
          </div>
          <button onClick={addTodo}>Add Todo</button>
        </div>
      </div>

      {todos.map((todo) => (
        <div key={todo.id}>
          <h2>Title: {todo.title}</h2>
          <p>Type: {formatTodoType(todo.todo_type)}</p>
          <p>Description: {todo.description}</p>
          <p>Date: {new Date(todo.due_date).toLocaleDateString()}</p>
          <p>
            Time: {todo.start_time} - {todo.end_time}
            {todo.start_time && todo.end_time && (
              <span> ({formatDuration(todo.start_time, todo.end_time)})</span> // Format TODO/Class duration
            )}
          </p>
          <p>
            Notification:{" "}
            {todo.notify_time
              ? new Date(todo.notify_time).toLocaleTimeString()
              : "No notification"}
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
