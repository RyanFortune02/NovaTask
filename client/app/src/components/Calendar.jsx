// Import FullCalendar and required plugins
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";     // Month-day grid views
import timeGridPlugin from "@fullcalendar/timegrid";   // Week-day time grid views
import interactionPlugin from "@fullcalendar/interaction"; // Enables event interaction
import listPlugin from "@fullcalendar/list";           // List view
import rrulePlugin from '@fullcalendar/rrule';  // Import RRule plugin

// The Calendar component to display events by month, week, day, list.
// @param {Array} events - Array of event objects to display on calendar
function Calendar({ events = [] }) {
    return (
        <div>
            <FullCalendar
                // Adds required plugins
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, rrulePlugin]} 
                
                // Set default view to month grid
                initialView="dayGridMonth"
                
                // Pass events data to calendar
                events={events}
                
                // Defines the calendar header with navigation and view options
                headerToolbar={{
                    start: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',  // Allows switching between month, week, day, and list views
                    center: 'title',                                          // Sets the current month position
                    end: 'today prev,next'                                   // Navigation buttons
                }}
                
                // Set calendar height to 90% of viewport height
                height={"90vh"}
            />
        </div>
    )
}

export default Calendar;
