import { useEffect, useState } from "react"; // State is a way for us to hold data that will manually trigger
// a re-render of the component when it changes
import Calendar from "./components/Calendar"; // Import the Calendar component
import "./App.css";
import Popup from "./components/Popup";
import ClassTimeTracker from "./components/ClassTimeTracker"; // Import the ClassTimeTracker component
import Card from "./components/Card"; // Import the Card component

// Array of motivational quotes
const quotes = [
  {
    text: "A little progress each day adds up to big results.",
    author: "- Satya Nani",
  },
  {
    text: "The future depends on what you do today.",
    author: "- Mahatma Gandhi",
  },
  {
    text: "Success is not the key to happiness. Happiness is the key to success.",
    author: "- Albert Schweitzer",
  },
  {
    text: "It always seems impossible until it's done.",
    author: "- Nelson Mandela",
  },
];

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
    checkNotifications(); // Check for notifications on initial load

    const intervalId = setInterval(checkNotifications, 60000); // Polling Notifications every minute
    // Fetch initial todos
    fetchTodos();
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []); // empty array as last argument means that the effect will only run once (on render of webpage)

  // useState is a hook that allows us to add state to our functional components
  // useState returns an array with two elements: the current state value and a function that allows us to update the state value
  const [todos, setTodos] = useState([]);
  const [editingTodoId, setEditingTodoId] = useState(null); // Store the todo being edited
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
  const [buttonPopup, setButtonPopup] = useState(false); // State to control the visibility of the popup
  const [timePopup, setTimePopup] = useState(false); // State to control the visibility of the time popup
  const [quote, setQuote] = useState({ text: "", author: "" }); // Store the current quote and author
  const [notificationContent, setNotificationContent] = useState({
    title: "",
    message: "",
    time: "",
  }); // Store the notification content
  const [showTimeTracker, setShowTimeTracker] = useState(true); // State to control the visibility of the time tracker
  const [ClicktoShowHours, setClicktoShowHours] = useState(false); 

  // Function to handle editing a todo item by setting the editingTodo state
  const handleEdit = (todo) => {
    setEditingTodoId(todo.id);
    setTitle(todo.title);
    setDescription(todo.description);
    setDueDate(todo.due_date);
    setStartTime(todo.start_time || '');
    setEndTime(todo.end_time || '');
    setTodoType(todo.todo_type);
    setRepeatType(todo.repeat_type);
    setRepeatFrequency(todo.repeat_frequency);
    setRepeatDays(todo.repeat_days);
    setRepeatEndDate(todo.repeat_end_time?.split('T')[0] || '');
    setNotifyTime(todo.notify_time?.split('T')[1]?.slice(0, 5) || '');
    setShowForm(true);
  };
  // Function to display a random quote
  const displayRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
    setButtonPopup(true);
  };

  // Function to display Hours 
  const displayHours = () => {
    setClicktoShowHours(true);
  }

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
    // Check required fields before proceeding
    if (!title || !dueDate || !startTime || !endTime) {
      alert(
        "must fill out all required fields (title, due date, start time, end time)"
      );
      return;
    }
    // Create notification datetime by combining due date and notify time
    let notifyDateTime = null;
    if (dueDate && notifyTime) {
      // Convert Notification time to local time
      const localDate = new Date(`${dueDate}T${notifyTime}`);
      notifyDateTime = localDate.toISOString(); // Convert time for backend
    }

    // If repeat end date is not provided, set it to null
    // If repeat end date is provided, set it to the end of the day
    let repeatEndDateTime = null;
    if (repeatEndDate) {
      repeatEndDateTime = `${repeatEndDate}T23:59:59`;
    }

    // Validate that end time is later than start time (to not allow negative entries)
    if (startTime && endTime && startTime >= endTime) {
      alert("End time must be later than start time.");
      return;
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
      const url = editingTodoId 
      ? `https://ryanfortune.pythonanywhere.com/api/todos/${editingTodoId}/`
      : "https://ryanfortune.pythonanywhere.com/api/todos/";

      const method = editingTodoId ? "PUT" : "POST"; // Use PUT for editing existing todos and POST for new todos

      const response = await fetch( url,
        {
          method, // Use the method determined above
          headers: { "Content-Type": "application/json"}, // Specifying the format of the data we are sending
          body: JSON.stringify(todoData), // Converts a JavaScript object or value to a JSON string
        });

      const data = await response.json();

      // Update the todos state with the new todo
      setTodos((prev) => {
        if (editingTodoId) {
          // If editing an existing todo, update the todo in the list
          return prev.map((t) => (t.id === editingTodoId ? data : t));
        } else {
          // If adding a new todo, add the new todo to the list
          return [...prev, data];
        }
      }
      );
      resetForm(); // Clear the form after successful addition
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const resetForm = () => {
    // Clear form after successful addition
    setTitle("");
    setDescription("");
    setDueDate("");
    setStartTime("");
    setEndTime("");
    setRepeatEndDate(""); // Clear repeat end date after successful addition
    setRepeatType("N"); // Reset repeat type to "Never"
    setRepeatFrequency(1); // Reset repeat frequency to 1
    setRepeatDays(0); // Reset repeat days bitmask
    setNotifyTime(""); // Reset notify time
    setEditingTodoId(null); // Reset editing todo ID
    setShowForm(false); // Hide the form after successful addition
    setTodoType("TODO"); // Reset todo type
  };

  // Add a cancel edit function
  const cancelEdit = () => {
    resetForm();
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

  // Function to check for notifications every minute
  const checkNotifications = async () => {
    try {
      const response = await fetch(
        "https://ryanfortune.pythonanywhere.com/api/todos/notify/"
      );
      const data = await response.json();

      if (data.length > 0) {
        // Show notification popup for each pending notification
        data.forEach((notification) => {
          // Display notification time in local format
          const notifyTime = new Date(
            notification.notify_time
          ).toLocaleTimeString();
          setTimePopup(true);
          // Update popup content
          setNotificationContent({
            title: `Notification for ${notification.title}`,
            time: `Time : ${notifyTime}`,
            message: notification.description,
          });
        });
      }
    } catch (error) {
      console.error("Error checking notifications:", error);
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
        // Add description to the event
        extendedProps: {
          description: todo.description,
        },
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

  const handleSubmit = async () => {
    try {
      // Add or update todo based on editing state
      await addTodo();
      
    } catch (error) {
      console.error("Error submitting todo:", error);
    }
  };

  return (
    <>
      <h1>NovaTask</h1>

      <div className="button-group">
        <ExternalButtonLink url="https://novoconnect.ncf.edu">
          NovoConnect
        </ExternalButtonLink>
        <ExternalButtonLink url="https://www.ncf.edu/wp-content/uploads/2025/02/2024-2025_UG_NCF-Academic-Calendar_Comprehensive_web4.pdf">
          NCF Deadlines
        </ExternalButtonLink>
        <ExternalButtonLink url="https://ncf.mywconline.com/schedule/calendar?scheduleid=sc66bb4dcdcf333">
          Academic Support Centers
        </ExternalButtonLink>
        <ExternalButtonLink url="https://www.ncf.edu/life-at-new/where-to-eat/">
          Dinning Services
        </ExternalButtonLink>
      </div>

      <div className="popup-buttons-container">
        <button onClick={displayRandomQuote}> Need motivation?</button>
        <button onClick={displayHours}> What time does it close?</button>
      </div>

      <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
        <p>{quote.text}</p>
        <p>{quote.author}</p>
      </Popup>

      <Popup trigger={timePopup} setTrigger={setTimePopup}>
        <h3>{notificationContent.title}</h3>
        <p>{notificationContent.time}</p>
        <p>{notificationContent.message}</p>
      </Popup>

      <Popup trigger={ClicktoShowHours} setTrigger={setClicktoShowHours}>
        <br></br>
        <h3>Career Engagement & Opportunity (CEO)</h3>
        <p>Monday - Friday: 8am - 5pm </p>

        <h3>Academic Resource Center (ARC)</h3>
        <p>Monday - Thursday: 8am - 11pm </p>
        <p>Friday: 8am - 5pm</p>
        <p>Saturday: 12pm - 6pm</p>
        <p>Sunday: 3pm - 11pm</p>

        <h3>Counseling & Wellness Services (CWC)</h3>
        <p>Monday - Friday: 8am - 5pm </p>

      </Popup>

     {/* Class Time Tracker Section */}
      <div className="time-tracking-container">
        <button className="toggle-form-button" onClick={() => setShowTimeTracker(!showTimeTracker)}>
          {showTimeTracker ? "Hide Time Tracker" : "Add Time Entry for a class"}
        </button>
        
        <div className={`time-tracking-section ${showTimeTracker ? "visible" : "hidden"}`}>
          <ClassTimeTracker todos={todos} />
        </div>
      </div>

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
          <div className="button-group">
            <button onClick={handleSubmit} className="submit-button">
              {editingTodoId ? "Update Todo" : "Add Todo"}
            </button>
                {editingTodoId && (
                <button onClick={cancelEdit} className="cancel-button">
                  Cancel Edit
                </button>
              )}
            </div>
        </div>
      </div>

      <div className="app-container">
      {todos.map((todo) => (
        <Card
          key={todo.id}
          title={todo.title}
          type={formatTodoType(todo.todo_type)}
          description={todo.description}
          date={ new Date(todo.due_date).toLocaleDateString()}
          time= {`${todo.start_time} - ${todo.end_time} (${formatDuration(todo.start_time, todo.end_time)})`}
          notification= {todo.notify_time
            ? new Date(todo.notify_time).toLocaleTimeString()
            : "No notification"}
          completed={todo.completed}
          onComplete={() => toggleComplete(todo)}
          onEdit={() => handleEdit(todo)}
          onDelete={() => deleteTodo(todo.id)}
        />
      ))}
      </div>
    </>
  );
}
export default App;
