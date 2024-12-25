import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import Events from "./components/event";
import EventDetails from './components/eventdetails';
import AddEvent from "./components/addevent";
import DashboardAndEvents from "./components/dashboard"; 
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/getevents" element={<DashboardAndEvents />} /> 
        <Route path="/events" element={<Events />} />
        <Route path="/event-details" element={<EventDetails />} />
        <Route path="/add-event" element={<AddEvent />} />
        <Route path="/add-event/:id" element={<AddEvent />} />
      </Routes>
    </Router>
  );
};

export default App;
