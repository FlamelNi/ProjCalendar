import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { addDays, startOfWeek } from "date-fns";
import { format, parseISO } from "date-fns";
import { auth, db } from "../firebase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// CalendarPage.tsx
import moment from "moment";
import { collection, getDocs } from "firebase/firestore";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const navigate = useNavigate();
  const [events] = useState([]);

  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // useEffect(() => {
  //   if (!auth.currentUser) {
  //     navigate("/login");
  //   }
  // }, [auth.currentUser, navigate]);

  interface Schedule {
    id: string;
    name: string;
    startDate: string;
    startTime: string;
    endTime: string;
    repeat: boolean;
    repeatDays: string[] | null;
    ownerId: string;
    sharedWith: string[];
  }

  interface FirestoreSchedule {
    name: string;
    startDate: string;
    startTime: string;
    endTime: string;
    repeat: boolean;
    repeatDays: string[] | null;
    ownerId: string;
    sharedWith: string[];
  }

  interface Schedule extends FirestoreSchedule {
    id: string;
  }

  const handleQuery = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "schedules"));
      const results: Schedule[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreSchedule;
        results.push({
          ...data,
          id: doc.id,
        });
      });
      setSchedules(results);
      console.log("Fetched documents:", results);
    } catch (error) {
      console.error("Error fetching documents:", error);
      alert("Error fetching data. Check console for details.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <button
        onClick={() => {
          handleQuery();
        }}
      >
        test
      </button>
      <h2>Welcome, {auth.currentUser?.displayName}</h2>
      <Calendar localizer={localizer} events={events} startAccessor="start" endAccessor="end" style={{ height: 600, marginTop: 20 }} />
    </div>
  );
}
