import React from "react";
import TopBar from "./TopBar/TopBar";
import UserSummary from "./UserSummary/UserSummary";
import CalendarController from "./Calendar/CalendarController";
import NavBar from "./NavBar/NavBar";

const UserCalendarPage = () => {
  return (
    <div>
      <TopBar />
      <UserSummary />
      <CalendarController />
      {/* Calendar grid goes here */}
      <NavBar />
    </div>
  );
};

export default UserCalendarPage;
