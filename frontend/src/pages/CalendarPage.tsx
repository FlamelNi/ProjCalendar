import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { Modal, Button, Form } from "react-bootstrap";
import { format } from "date-fns";

const localizer = momentLocalizer(moment);

interface Schedule {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  ownerId: string;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    repeat: false,
    repeatDays: null,
  });

  // Fetch schedules on load
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        if (!auth.currentUser) return;

        const userId = auth.currentUser.uid;
        const querySnapshot = await getDocs(collection(db, "schedules"));
        const results: Schedule[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Only add schedules that belong to the current user
          if (data.ownerId === userId) {
            results.push({
              id: doc.id,
              name: data.name,
              startTime: data.startTime.toDate(),
              endTime: data.endTime.toDate(),
              ownerId: data.ownerId,
            });
          }
        });
        setSchedules(results);
      } catch (error) {
        console.error("Error fetching documents:", error);
        alert("Error fetching data. Check console for details.");
      }
    };

    fetchSchedules();
  }, []);

  // Open modal for new or existing schedule
  const openModal = (schedule?: Schedule, slotInfo?: any) => {
    if (schedule) {
      // Edit existing schedule
      setSelectedScheduleId(schedule.id);
      setNewSchedule({
        name: schedule.name,
        startDate: format(schedule.startTime, "yyyy-MM-dd"),
        startTime: format(schedule.startTime, "HH:mm"),
        endDate: format(schedule.endTime, "yyyy-MM-dd"),
        endTime: format(schedule.endTime, "HH:mm"),
        repeat: false, // Add this line
        repeatDays: null, // Add this line
      });
    } else if (slotInfo) {
      // New schedule with pre-filled dates
      const startDate = format(slotInfo.start, "yyyy-MM-dd");
      const startTime = format(slotInfo.start, "HH:mm");
      const endDate = format(
        slotInfo.start.toDateString() === slotInfo.end.toDateString() ? slotInfo.end : new Date(slotInfo.end.getTime() - 24 * 60 * 60 * 1000),
        "yyyy-MM-dd"
      );
      const endTime = format(slotInfo.end, "HH:mm");

      setNewSchedule({
        name: "",
        startDate,
        startTime,
        endDate,
        endTime,
        repeat: false, // Add this line
        repeatDays: null, // Add this line
      });

      setSelectedScheduleId(null);
    }

    setIsModalOpen(true);
  };

  // Create or update schedule
  const handleSaveSchedule = async () => {
    try {
      if (!auth.currentUser) {
        alert("You must be logged in to create or edit a schedule.");
        return;
      }

      const ownerId = auth.currentUser.uid;
      const startTimestamp = Timestamp.fromDate(new Date(`${newSchedule.startDate}T${newSchedule.startTime}`));
      const endTimestamp = Timestamp.fromDate(new Date(`${newSchedule.endDate}T${newSchedule.endTime}`));

      if (selectedScheduleId) {
        // Update existing schedule
        const docRef = doc(db, "schedules", selectedScheduleId);
        await updateDoc(docRef, {
          name: newSchedule.name,
          startTime: startTimestamp,
          endTime: endTimestamp,
          repeat: newSchedule.repeat,
          repeatDays: newSchedule.repeatDays,
        });
        setSchedules((prev) =>
          prev.map((s) =>
            s.id === selectedScheduleId ? { ...s, name: newSchedule.name, startTime: startTimestamp.toDate(), endTime: endTimestamp.toDate() } : s
          )
        );
      } else {
        // Create new schedule
        const docRef = await addDoc(collection(db, "schedules"), {
          name: newSchedule.name,
          startTime: startTimestamp,
          endTime: endTimestamp,
          repeat: newSchedule.repeat,
          repeatDays: newSchedule.repeatDays,
          ownerId,
          sharedWith: [],
        });
        setSchedules((prev) => [
          ...prev,
          {
            id: docRef.id,
            name: newSchedule.name,
            startTime: startTimestamp.toDate(),
            endTime: endTimestamp.toDate(),
            repeat: newSchedule.repeat,
            repeatDays: newSchedule.repeatDays,
            ownerId,
            sharedWith: [],
          },
        ]);
      }

      setIsModalOpen(false);
      alert("Schedule saved!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Error saving schedule. Check console for details.");
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async () => {
    try {
      if (!selectedScheduleId) return;

      const docRef = doc(db, "schedules", selectedScheduleId);
      await deleteDoc(docRef);
      setSchedules((prev) => prev.filter((s) => s.id !== selectedScheduleId));
      setIsModalOpen(false);
      alert("Schedule deleted!");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Error deleting schedule. Check console for details.");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Welcome, {auth.currentUser?.displayName}</h2>
      <Calendar
        localizer={localizer}
        events={schedules.map((schedule) => ({
          id: schedule.id,
          title: schedule.name,
          start: schedule.startTime,
          end: schedule.endTime,
          ownerId: schedule.ownerId,
        }))}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        selectable
        defaultView="week"
        onSelectSlot={(slotInfo) => openModal(undefined, slotInfo)}
        onSelectEvent={(event) => {
          // Pass the full schedule object to openModal
          const selectedSchedule = schedules.find((s) => s.id === event.id);
          if (selectedSchedule) openModal(selectedSchedule);
        }}
        style={{ height: 600, marginTop: 20 }}
      />

      {/* Bootstrap Modal */}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedScheduleId ? "Edit Schedule" : "Create New Schedule"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Schedule Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter schedule name"
                value={newSchedule.name}
                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={newSchedule.startDate}
                onChange={(e) => setNewSchedule({ ...newSchedule, startDate: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="time"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" value={newSchedule.endDate} onChange={(e) => setNewSchedule({ ...newSchedule, endDate: e.target.value })} />
            </Form.Group>

            <Form.Group>
              <Form.Label>End Time</Form.Label>
              <Form.Control type="time" value={newSchedule.endTime} onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteSchedule} disabled={!selectedScheduleId}>
            Delete
          </Button>
          <Button variant="primary" onClick={handleSaveSchedule}>
            {selectedScheduleId ? "Save Changes" : "Create Schedule"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
