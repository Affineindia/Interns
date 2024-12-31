import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Events from "./components/event";
import EventDetails from "./components/eventdetails";
import EventList from "./components/eventlist";
import AddEvent from "./components/addevent";
import Dashboard from "./components/Dashboard";
import Register from "./components/register";


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Authentication Route */}
        <Route path="/" element={<Login />} />

        {/* Main Application Routes */}
        <Route path="/events" element={<Events />} />
        <Route path="/event-details" element={<EventDetails />} />
        <Route path="/getevents" element={<EventList />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />

        {/* Event Management Routes */}
        <Route path="/add-event" element={<AddEvent />} />
        <Route path="/add-event/:id" element={<AddEvent />} />
      </Routes>
    </Router>
  );
};

export default App;
