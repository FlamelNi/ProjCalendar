import React from "react";
import "./CalendarController.css";
import { Button } from "react-bootstrap";

const CalendarController = () => (
  <div className="calendar-controller">
    <button className="nav-btn">←</button>
    <button className="nav-btn">→</button>
    <Button>Today</Button>
    <button className="plus-btn">+</button>
  </div>
);

export default CalendarController;
