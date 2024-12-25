import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./addevent.css";

const AddEvent = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isEditMode, setIsEditMode] = useState(false); 
  const [preview, setPreview] = useState(null); // For image preview
  const [eventData, setEventData] = useState({
    event_name: "",
    country: "",
    state: "",
    city: "",
    address: "",
    category: "",
    dateandtime: "",
    organised_by: "",
    description_event: "",
  });
  const [image, setImage] = useState(null); 
  const [eventId, setEventId] = useState(null); 

  useEffect(() => {
    document.body.classList.add("add-event-background");

    return () => {
      document.body.classList.remove("add-event-background");
    };
  }, []);

  useEffect(() => {
    if (location.state?.event) {
      setIsEditMode(true); 
      const event = location.state.event;
      setEventData(event); 
      setEventId(event.event_id);
      setPreview(event.image_url ? `http://127.0.0.1:8000${event.image_url}` : null); // For editing, set the image preview
    }
  }, [location.state]);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file)); 
  };
  // const handleImageUpload = async (file) => {
  //   const formData = new FormData();
  //   formData.append("file", file);
  
  //   const response = await axios.post("http://127.0.0.1:8000/upload-image/", formData);
  //   return response.data.file_url;
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("event_name", eventData.event_name);
    formData.append("country", eventData.country);
    formData.append("state", eventData.state);
    formData.append("city", eventData.city);
    formData.append("address", eventData.address);
    formData.append("category", eventData.category);
    formData.append("dateandtime", eventData.dateandtime);
    formData.append("organised_by", eventData.organised_by);
    formData.append("description", eventData.description_event);
  
    if (image) formData.append("image_url", image);
  
    console.log("FormData Debug:");
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
  
    try {
      const url = isEditMode
        ? `http://127.0.0.1:8000/events/${eventId}`
        : "http://127.0.0.1:8000/events";
      const method = isEditMode ? "put" : "post";
  
      await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      alert(isEditMode ? "Event updated successfully!" : "Event added successfully!");
      navigate("/getevents");
    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      alert("Failed to submit the form. Please try again.");
    }
  };

  return (
    <div className="add-event-form">
      {/* Go Back Button */}
      <button className="go-back-btn" onClick={() => navigate("/getevents")}>
        &#8592; Go Back
      </button>

      <h1>{isEditMode ? "Edit Event" : "Add New Event"}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="event_name"
          placeholder="Event Name"
          value={eventData.event_name}
          onChange={handleChange}
          required
        />
        
        {/* Image Preview */}
        {preview && <img src={preview} alt="Preview" className="image-preview" />}
        
        <input type="file" name="image_url" onChange={handleImageChange} accept="image/*"/>
        
        <input
          type="datetime-local"
          name="dateandtime"
          placeholder="Date and Time"
          value={eventData.dateandtime}
          onChange={handleChange}
          required
        />
        
        <select
          name="category"
          value={eventData.category}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Category</option>
          <option value="Health & Wellness">Health & Wellness</option>
          <option value="Technology">Technology</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Education">Education</option>
          <option value="Sports">Sports</option>
          <option value="Marriage">Marriage</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="text"
          name="organised_by"
          placeholder="Organised By"
          value={eventData.organised_by}
          onChange={handleChange}
          required
        />

        <textarea
          name="description_event"
          className="description-input"
          placeholder="Description"
          value={eventData.description_event}
          onChange={handleChange}
          required
          rows="4"
        />
        
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={eventData.country}
          onChange={handleChange}
          required
        />
        
        <input
          type="text"
          name="state"
          placeholder="State"
          value={eventData.state}
          onChange={handleChange}
          required
        />
        
        <input
          type="text"
          name="city"
          placeholder="City"
          value={eventData.city}
          onChange={handleChange}
          required
        />
        
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={eventData.address}
          onChange={handleChange}
          required
        />
        
        <button type="submit" className="submit-btn">
          {isEditMode ? "Update Event" : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AddEvent;
