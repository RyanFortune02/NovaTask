// Import FullCalendar and required plugins
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";     // Month-day grid views
import timeGridPlugin from "@fullcalendar/timegrid";   // Week-day time grid views
import interactionPlugin from "@fullcalendar/interaction"; // Enables event interaction
import listPlugin from "@fullcalendar/list";           // List view
import rrulePlugin from '@fullcalendar/rrule';  // Import RRule plugin
import * as bootstrap from "bootstrap"; // Import Bootstrap JS
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

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
                
                // Defines the calendar header with navigation and view options
                headerToolbar={{
                    start: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',  // Allows switching between month, week, day, and list views
                    center: 'title',                                          // Sets the current month position
                    end: 'today prev,next'                                   // Navigation buttons
                }}
                
                // Set calendar height to 90% of viewport height
                height={"90vh"}
                // Pass events data to calendar
                events={events}
                eventDidMount={(info) => {
                    // Create a popover with event details
                    const content = `
                      <div>
                        <p><strong>Time:</strong> ${info.event.start ? info.event.start.toLocaleTimeString() : 'N/A'} 
                          ${info.event.end ? '- ' + info.event.end.toLocaleTimeString() : ''}</p>
                        <p><strong>Description:</strong> ${info.event.extendedProps.description || 'No description'}</p>
                      </div>
                    `;
                    // Initialize Bootstrap popover 
                    return new bootstrap.Popover(info.el, {
                      title: info.event.title,
                      placement: "auto",
                      trigger: "hover",
                      content: content,
                      html: true
                    });
                  }}
            />
        </div>
    )
}

export default Calendar;
