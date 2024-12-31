import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./eventdetails.css";

const EventDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;

  useEffect(() => {
    document.body.classList.add("background");

    return () => {
      document.body.classList.remove("background");
    };
  }, []);

  if (!event) {
    return <p>No event details available.</p>;
  }

  // Fallback for image if not available
  

  return (
    <div className="event-details">
      <button className="go-back-btn" onClick={() => navigate("/getevents")}>
        &#8592; Back to Events
      </button>
      <h1>{event.event_name}</h1>
      <img src={`http://127.0.0.1:8000/${event.image_url}`} alt={event.event_name} className="event-details-image" />
      <p className="description">
        <strong>Description:</strong> {event.description_event}
      </p>
      <p>
        <strong>Date and Time:</strong> {new Date(event.dateandtime).toLocaleString()}
      </p>
      <p>
        <strong>Category:</strong> {event.category}
      </p>
      <p>
        <strong>Organised By:</strong> {event.organised_by}
      </p>
      <p>
        <strong>Location:</strong> {`${event.city}, ${event.state}, ${event.country}`}
      </p>
      <p>
        <strong>Address:</strong> {event.address}
      </p>
      <button className="book-btn" onClick={() => navigate("/getevents")}>
        Book Event
      </button>
    </div>
  );
};

export default EventDetails;
