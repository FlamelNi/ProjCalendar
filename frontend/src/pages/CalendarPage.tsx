import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { addDays, startOfWeek } from "date-fns";
import { format, parseISO } from "date-fns";
import { auth } from "../firebase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// CalendarPage.tsx
import moment from "moment";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const navigate = useNavigate();
  const [events] = useState([]);

  // useEffect(() => {
  //   if (!auth.currentUser) {
  //     navigate("/login");
  //   }
  // }, [auth.currentUser, navigate]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Welcome, {auth.currentUser?.displayName}</h2>
      <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: 600, marginTop: 20 }} />
    </div>
  );
}
