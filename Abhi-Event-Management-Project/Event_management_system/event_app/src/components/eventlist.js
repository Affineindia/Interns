import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./eventlist.css";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setUserRole] = useState("user");
  const [filters, setFilters] = useState({
    category: "",
    dateRange: { start: "", end: "" },
    location: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
    useEffect(() => {
      document.body.classList.add("add-event-background");
  
      return () => {
        document.body.classList.remove("add-event-background");
      };
    }, []);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    setUserRole(storedRole || "user");

    const fetchEvents = async () => {
      try {
        if (location.state?.events) {
          setEvents(location.state.events);
          setFilteredEvents(location.state.events);
        } else {
          const response = await axios.get("http://127.0.0.1:8000/events");
          setEvents(response.data);
          setFilteredEvents(response.data);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch events. Please try again.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, [location.state]);
  

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/events/${eventId}`);
        alert("Event deleted successfully!");
        const updatedEvents = events.filter((event) => event.event_id !== eventId);
        setEvents(updatedEvents);
        setFilteredEvents(updatedEvents);
      } catch (err) {
        console.error("Error deleting event:", err.response?.data || err.message);
        alert("Failed to delete the event. Please try again.");
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = events;
    if (filters.event_name) {
      filtered = filtered.filter((event) => event.event_name === filters.event_name);
    }

    if (filters.category) {
      filtered = filtered.filter((event) => event.category === filters.category);
    }

    if (filters.location) {
      filtered = filtered.filter(
        (event) =>
          event.city.toLowerCase().includes(filters.location.toLowerCase()) ||
          event.state.toLowerCase().includes(filters.location.toLowerCase()) ||
          event.country.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.dateandtime);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        return (
          (!startDate || eventDate >= startDate) &&
          (!endDate || eventDate <= endDate)
        );
      });
    }

    setFilteredEvents(filtered);
  };
  const resetFilters = () => {
    setFilters({
      category: "",
      dateRange: { start: "", end: "" },
      location: "",
      event_name: "",
    });
    setFilteredEvents(events); // Reset the filtered list to the original events list
  };

  if (loading) return <p className="loading">Loading events...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="event-list">
      <div className="top">
        <img
          src="https://www.logolynx.com/images/logolynx/7f/7f0b42ea89979e09c58b53a13e4565d9.jpeg"
          alt="Logo"
          className="header-logo"
        />
        <div className="navbar-title">Event Management</div>
        <header className="navbar">
          {role === "admin" && (
            <button className="navbar-btn" onClick={() => navigate("/add-event")}>
              Add Event
            </button>
          )}
          <button className="navbar-btn" onClick={() => navigate("/")}>
            Log out
          </button>
        </header>
      </div>
      <div className="filter-section">
  <h3>Filter Events</h3>
  <div className="filter-group">
    <label>
      Event name:
      <input
        type="text"
        name="event_name"
        value={filters.event_name}
        onChange={handleFilterChange}
        placeholder="Enter event name"
      />
    </label>
    <label>
      Category:
      <input
        type="text"
        name="category"
        value={filters.category}
        onChange={handleFilterChange}
        placeholder="Enter category"
      />
    </label>
    <label>
      Location:
      <input
        type="text"
        name="location"
        value={filters.location}
        onChange={handleFilterChange}
        placeholder="Enter location"
      />
    </label>
    <label>
      Start Date:
      <input
        type="date"
        name="dateRange.start"
        value={filters.dateRange.start}
        onChange={(e) =>
          setFilters((prevFilters) => ({
            ...prevFilters,
            dateRange: { ...prevFilters.dateRange, start: e.target.value },
          }))
        }
      />
    </label>
    <label>
      End Date:
      <input
        type="date"
        name="dateRange.end"
        value={filters.dateRange.end}
        onChange={(e) =>
          setFilters((prevFilters) => ({
            ...prevFilters,
            dateRange: { ...prevFilters.dateRange, end: e.target.value },
          }))
        }
      />
    </label>
    <button className="filter-btn" onClick={applyFilters}>
      Apply Filters
    </button>
    <button className="filter-btn refresh-btn" onClick={resetFilters}>
      Refresh
    </button>
  </div>
</div>
      <div className="events-container">
        <table className="event-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Category</th>
              <th>Organised By</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.event_id}>
                <td>{event.event_name}</td>
                <td>{new Date(event.dateandtime).toLocaleString()}</td>
                <td>{event.category}</td>
                <td>{event.organised_by}</td>
                <td>{`${event.city}, ${event.state}, ${event.country}`}</td>
                <td>
                  {role === "admin" && (
                    <>
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
                    </>
                  )}
                  <button
                    className="view-btn"
                    onClick={() => navigate("/event-details", { state: { event } })}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventList;
