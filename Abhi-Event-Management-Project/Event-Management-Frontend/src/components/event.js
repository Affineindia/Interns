import React from 'react';
import { useNavigate } from 'react-router-dom';
import './events.css';
// Event data
const events = [
  { "id": 1, "name": "Yoga Retreat", "date": "2024-12-15", "image": "yoga.jpg" },
  { "id": 2, "name": "Coding Hackathon", "date": "2024-12-20", "image": "hackathon.png" },
  { "id": 3, "name": "Stand-up Comedy Night", "date": "2024-12-23", "image": "comedy.png" },
  { "id": 4, "name": "Book Fair", "date": "2024-12-28", "image": "bookfair.png" },
  { "id": 5, "name": "Marriage", "date": "2025-01-05", "image": "marriage.png" },
];

function Events() {
  const navigate = useNavigate(); // Hook for programmatic navigation

  const handleViewDetails = (id) => {
    navigate(`/events/${id}`); // Navigates to the event details page with the event ID
  };

  return (
    <div className="events-container">
    <h1 className="page-heading">EVENTS</h1> {/* Added Page Heading */}
<div className="events-list">
  {events.map((event) => (
    <div key={event.id} className="event-item">
      <img src={event.image} alt={event.name} className="event-image" />
      <h3>{event.name}</h3>
      <p>{event.date}</p>
      <button
        className="view-details-btn"
        onClick={() => handleViewDetails(event.id)}
      >
        View Details
      </button>
    </div>
  ))}
</div>
</div>
);
}

export default Events
