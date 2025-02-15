import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

function Calendar({ events = [] }) {
    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                events={events}
                headerToolbar={{
                    start: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                    center: 'title',
                    end: 'today prev,next'
                }}
                height={"90vh"}
            />
        </div>
    )
}

export default Calendar;
