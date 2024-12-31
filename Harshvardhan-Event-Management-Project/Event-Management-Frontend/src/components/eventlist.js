import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./eventlist.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setUserRole] = useState("User");
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    setUserRole(storedRole || "User");

    const fetchEvents = async () => {
      try {
        if (location.state?.events) {
          const sortedEvents = sortByDate(location.state.events);
          setEvents(sortedEvents);
          setFilteredEvents(sortedEvents);
        } else {
          const response = await axios.get("http://127.0.0.1:8000/events");
          const sortedEvents = sortByDate(response.data);
          setEvents(sortedEvents);
          setFilteredEvents(sortedEvents);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch events. Please try again.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, [location.state]);

  const sortByDate = (eventList) =>
    eventList.sort((a, b) => new Date(a.dateandtime) - new Date(b.dateandtime));

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/events/${eventId}`);
        alert("Event deleted successfully!");
        const updatedEvents = events.filter((event) => event.event_id !== eventId);
        setEvents(updatedEvents);
        setFilteredEvents(updatedEvents);
      } catch (err) {
        alert("Failed to delete the event. Please try again.");
      }
    }
  };

  const handleFilter = () => {
    let filtered = events;

    if (searchName) {
      filtered = filtered.filter((event) =>
        event.event_name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.dateandtime).setHours(0, 0, 0, 0);
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(0, 0, 0, 0);
        return eventDate >= start && eventDate <= end;
      });
    }

    setFilteredEvents(filtered);
  };

  const refreshEvents = async () => {
    setSearchName("");
    setStartDate("");
    setEndDate("");
    try {
      const response = await axios.get("http://127.0.0.1:8000/events");
      const sortedEvents = sortByDate(response.data);
      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);
    } catch (err) {
      alert("Failed to refresh events. Please try again.");
    }
  };

  if (loading) return <p className="loading">Loading events...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="event-list">
      <div className="top">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrF7Rtc9JwePjxzZtKuZ9v8ogiKvKpeB_exQ&s"
          alt="Logo"
          className="header-logo"
        />
        <div className="navbar-title">Event Management</div>
        <header className="navbar">
          <button className="navbar-btn" onClick={() => navigate("/")}>
            Log out
          </button>
        </header>
      </div>

      <button
        className="view-dashboard-btn"
        onClick={() => navigate("/dashboard", { state: { events } })}
      >
        View Dashboard
      </button>

      <div className="add-event-container">
        {role === "admin" && (
          <button className="add-event-btn" onClick={() => navigate("/add-event")}>
            Add Event
          </button>
        )}
      </div>

      <div className="event-table">
        <div className="table-header">
          <h3>Event List</h3>
          <div className="table-filters">
            <input
              type="text"
              placeholder="Search by Event Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="filter-input"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="filter-input"
              placeholder="End Date"
            />
            <button onClick={handleFilter} className="filter-btn">
              Apply Filters
            </button>
            <button onClick={refreshEvents} className="refresh-btn">
              Refresh
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Event Name</th>
              <th>Date & Time</th>
              <th>Category</th>
              <th>Organised By</th>
              <th>Location</th>
              {role === "admin" && <th>Actions</th>}
              {role === "user" && <th>Details</th>}
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.event_id}>
                <td>
                  <img
                    src={`http://127.0.0.1:8000/${event.image_url}`}
                    alt={event.event_name}
                    className="event-image-table"
                  />
                </td>
                <td>{event.event_name}</td>
                <td>{new Date(event.dateandtime).toLocaleString()}</td>
                <td>{event.category}</td>
                <td>{event.organised_by}</td>
                <td>{`${event.city}, ${event.state}, ${event.country}`}</td>
                {role === "admin" && (
                  <td>
                    <div className="button-container">
                      <button
                        className="edit-btn"
                        onClick={() => navigate("/add-event", { state: { event } })}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(event.event_id)}
                      >
                        Delete
                      </button>
                      <button
                        className="view-details-btn"
                        onClick={() => navigate("/event-details", { state: { event } })}
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                )}
                {role === "user" && (
                  <td>
                    <button
                      className="view-details-btn"
                      onClick={() => navigate("/event-details", { state: { event } })}
                    >
                      View Details
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventList;
