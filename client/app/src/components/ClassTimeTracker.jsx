import { useState, useEffect } from "react";
import "./ClassTimeTracker.css"; // Import CSS for styling

// Component to track time spent on different classes
const ClassTimeTracker = ({ todos }) => {
  const [classes, setClasses] = useState([]); // Store classes
  const [selectedClass, setSelectedClass] = useState(""); // Currently selected class
  const [timeEntries, setTimeEntries] = useState([]);
  const [hoursSpent, setHoursSpent] = useState("");
  const [minutesSpent, setMinutesSpent] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(getWeekStartDate());
  const [weekDisplay, setWeekDisplay] = useState("");

  // Gets the start date of the current week
  // Used to initialize selectedWeek state
  function getWeekStartDate(date = new Date()) {
    const d = new Date(date); // Create a new date object
    const day = d.getDay(); // Get the current day of the week (0-6)
    const diff = d.getDate() - day; // Calculate the difference to get to the start of the week (Sunday)
    d.setDate(diff); // Set the date to the start of the week
    return d.toISOString().split("T")[0]; // Return the date in YYYY-MM-DD format
  }

  // Formats the date to MM/DD
  // Used to display the week range
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Fetch time entries when selected class or week changes
  useEffect(() => {
    if (selectedClass) {
      fetchTimeEntries();
    }
  }, [selectedClass, selectedWeek]);

  // Update week display whenever selected week changes
  useEffect(() => {
    const start = new Date(selectedWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    setWeekDisplay(`${formatDate(start)} - ${formatDate(end)}`);
  }, [selectedWeek]);

  useEffect(() => {
    // Filter classes from todos and set them
    const classesOnly = todos.filter((todo) => todo.todo_type === "CLASS");
    setClasses(classesOnly);
  }, [todos]);

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch(
        `https://ryanfortune.pythonanywhere.com/api/times/`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTimeEntries(Array.isArray(data) ? data : []); // Ensure data is an array
    } catch (error) {
      console.error("Error fetching time entries:", error);
      setTimeEntries([]); // Set empty array on error
    }
  };

  // Previous week button handler
  const previousWeek = () => {
    const newDate = new Date(selectedWeek); // Get the current selected week
    newDate.setDate(newDate.getDate() - 7); // Subtract 7 days to go to the previous week
    setSelectedWeek(newDate.toISOString().split("T")[0]); // Update the selected week state
  };

  // Next week button handler
  const nextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate.toISOString().split("T")[0]);
  };

  const addTimeEntry = async () => {
    // Check for negative time entries, checks wether hoursSpent or minutesSpent is less than 0
    if (parseInt(hoursSpent || 0) < 0 || parseInt(minutesSpent || 0) < 0) {
      // || 0 is used to handle empty inputs
      alert("Time entry can not be negative");
      return;
    }
    // Check if selected class and time spent are valid
    if (!selectedClass || (!hoursSpent && !minutesSpent)) return;

    // Convert hours and minutes to total minutes
    const totalMinutes =
      parseInt(hoursSpent || 0) * 60 + parseInt(minutesSpent || 0);

    try {
      const response = await fetch(
        "https://ryanfortune.pythonanywhere.com/api/times/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Send the new time entry data
          body: JSON.stringify({
            todo: selectedClass,
            week_start_date: selectedWeek,
            minutes_spent: totalMinutes,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTimeEntries([...timeEntries, data]); // Update time entries state
        // Reset input fields
        setHoursSpent("");
        setMinutesSpent("");
      }
    } catch (error) {
      console.error("Error adding time entry:", error);
    }
  };

  // Delete time entry by TODO ID
  const deleteTimeEntry = async (todoId) => {
    try {
      const response = await fetch(
        `https://ryanfortune.pythonanywhere.com/api/times/${todoId}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchTimeEntries();
      } else {
        const errorText = await response.text();
        console.error("Failed to delete entry:", errorText);
        throw new Error(`Failed to delete entry: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting time entry:", error);
    }
  };

  // Calculate total time per class for selected week
  const calculateWeeklyTime = () => {
    if (!timeEntries || !todos) return {};

    return (
      timeEntries
        // Filter entries for the selected week
        .filter((entry) => entry.week_start_date === selectedWeek)
        // Reduce entries to calculate total time per class
        .reduce((acc, entry) => {
          const todo = todos.find((t) => t.id === entry.todo);
          if (!todo) return acc;

          if (!acc[todo.title]) {
            acc[todo.title] = 0;
          }
          acc[todo.title] += entry.minutes_spent;
          return acc;
        }, {})
    );
  };

  // Format total minutes to hours and minutes for display
  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60); // Calculate hours
    const minutes = totalMinutes % 60; // Calculate remaining minutes
    return `${hours > 0 ? `${hours}h ` : ""}${
      minutes > 0 ? `${minutes}m` : ""
    }`; // Return formatted time
  };

  return (
    <div className="tracker">
      <h2>Class Time Tracker</h2>
      <div className="tracker-content">
        <div className="tracker-form">
          <div>
            <label>Select Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.title}
                </option>
              ))}
            </select>
          </div>

          <div className="week-nav">
            <label>Week:</label>
            <button onClick={previousWeek}>←</button>
            <span>{weekDisplay}</span>
            <button onClick={nextWeek}>→</button>
          </div>

          <div>
            <label>Time Spent:</label>
            <input
              type="number"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              placeholder="Hours"
              min="0"
            />
            <span>h</span>
            <input
              type="number"
              value={minutesSpent}
              onChange={(e) =>
                setMinutesSpent(Math.min(59, parseInt(e.target.value) || 0))
              }
              placeholder="Min"
              min="0"
              max="59"
            />
            <span>m</span>
          </div>

          <button onClick={addTimeEntry}>Add Time Entry</button>
        </div>

        <div className="tracker-entries">
          <h3>Weekly Class Summary</h3>
          <p>Week of {new Date(selectedWeek).toLocaleDateString()}</p>
          {Object.entries(calculateWeeklyTime()).map(([name, minutes]) => {
            const selected =
              selectedClass === todos.find((t) => t.title === name)?.id;
            return (
              <div key={name} className={selected ? "selected" : ""}>
                <h4>{name}</h4>
                <p>Time Spent: {formatTime(minutes)}</p>
                <button
                  onClick={() => {
                    const todoId = todos.find((t) => t.title === name)?.id;
                    if (todoId) {
                      deleteTimeEntry(todoId);
                    } else {
                      console.error("Could not find todo ID for class:", name);
                    }
                  }}
                >
                  Delete Entry
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClassTimeTracker;
