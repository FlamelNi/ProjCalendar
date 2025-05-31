import React from "react";
import TopBar from "./TopBar/TopBar";
import UserSummary from "./UserSummary/UserSummary";
import NavBar from "./NavBar/NavBar";
import CalendarComp from "./Calendar/CalendarComp";

const UserCalendarPage = () => {
  return (
    <div>
      <TopBar />
      <UserSummary />
      <CalendarComp />
      <NavBar />
    </div>
  );
};

export default UserCalendarPage;
