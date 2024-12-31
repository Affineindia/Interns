import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./eventdetails.css";

const EventDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;

  const [isBooked, setIsBooked] = useState(false);
  const userRole = localStorage.getItem("userRole") || "user";
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    document.body.classList.add("background");

    if (event && userEmail) {
      checkIfBooked(event.event_id, userEmail);
    }

    return () => {
      document.body.classList.remove("background");
    };
  }, [event, userEmail]);

  const checkIfBooked = async (eventId, email) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/bookevent/status?event_id=${eventId}&email=${email}`
      );
      if (response.data.is_booked) {
        setIsBooked(true);
      }
    } catch (error) {
      console.error("Error checking booking status:", error);
    }
  };

  if (!event) {
    return <p>No event details available.</p>;
  }

  const handleBookEvent = async () => {
    try {
      console.log("Booking event:", {
        event_id: event.event_id,
        email: userEmail,
        event_name: event.event_name,
      });
  
      const response = await axios.post("http://127.0.0.1:8000/bookevent", {
        event_id: event.event_id,
        email: userEmail,
        event_name: event.event_name,
      });
  
      if (response.status === 201) {
        setIsBooked(true);
        alert("Event successfully booked!");
      }
    } catch (error) {
      console.error("Error booking event:", error);
  
      let errorMessage = "Failed to book the event. Please try again later.";
      if (error.response) {
        errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from the server. Please check your connection.";
      }
  
      alert(errorMessage);
    }
  };
  

  return (
    <div className="event-details">
      <button className="go-back-btn" onClick={() => navigate("/getevents")}>
        &#8592; Back to Events
      </button>
      <h1>{event.event_name}</h1>
      <img
        src={`http://127.0.0.1:8000/${event.image_url}`}
        alt={event.event_name}
        className="event-details-image"
      />
      <p className="description">
        <strong>Description:</strong> {event.description_event}
      </p>
      <p>
        <strong>Date and Time:</strong>{" "}
        {new Date(event.dateandtime).toLocaleString()}
      </p>
      <p>
        <strong>Category:</strong> {event.category}
      </p>
      <p>
        <strong>Organised By:</strong> {event.organised_by}
      </p>
      <p>
        <strong>Location:</strong>{" "}
        {`${event.city}, ${event.state}, ${event.country}`}
      </p>
      <p>
        <strong>Address:</strong> {event.address}
      </p>

      {/* Show Book Event button only for users and when not already booked */}
      {userRole === "user" && !isBooked && (
        <button className="book-btn" onClick={handleBookEvent}>
          Book Event
        </button>
      )}

      {/* Show a notice when the event is booked */}
      {isBooked && <p className="booked-notice">You have already booked this event!</p>}
    </div>
  );
};

export default EventDetails;
