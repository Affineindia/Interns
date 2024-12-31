import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import "./Dashboard.css"; // Create a CSS file for additional styles

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [tomorrowEvents, setTomorrowEvents] = useState([]);
  const [notified, setNotified] = useState(false); // Track if notification is shown
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/events");
        setEvents(response.data || []);
      } catch (error) {
        console.error("Failed to fetch events", error);
        setEvents([]); // Ensure fallback
      }
    };

    fetchEvents();
  }, []); // Fetch events on component mount

  useEffect(() => {
    if (events.length > 0 && !notified) { // Only filter and show notification if not already notified
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const filteredTomorrowEvents = events.filter(event => {
        const eventDate = new Date(event.dateandtime);
        return (
          eventDate.getFullYear() === tomorrow.getFullYear() &&
          eventDate.getMonth() === tomorrow.getMonth() &&
          eventDate.getDate() === tomorrow.getDate()
        );
      });

      setTomorrowEvents(filteredTomorrowEvents);

      // Show notification if there are tomorrow's events and not notified yet
      if (filteredTomorrowEvents.length > 0) {
        toast.info(
          <div>
            <h4>Tomorrow's Events</h4>
            <ul>
              {filteredTomorrowEvents.map(event => (
                <li key={event.event_id}>
                  {event.event_name} at {new Date(event.dateandtime).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>,
          { autoClose: 10000 } // Auto-dismiss after 10 seconds
        );
        setNotified(true); // Set notified to true so the notification doesn't show again
      }
    }
  }, [events, notified]); // Only trigger when events change or notification hasn't been shown

  const eventsThisWeek = (events || []).filter(event => {
    const eventDate = new Date(event.dateandtime);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return eventDate >= startOfWeek && eventDate <= endOfWeek;
  }).length;

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Events This Week',
        data: Array.from({ length: 7 }, (_, i) => {
          const day = new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + i + 1));
          return (events || []).filter(event => {
            const eventDate = new Date(event.dateandtime);
            return eventDate.toDateString() === day.toDateString();
          }).length;
        }),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Events This Week',
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1, // Ensure Y-axis increments by 1
          callback: function (value) {
            return Number.isInteger(value) ? value : null; // Only show integer values
          },
        },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <ToastContainer position="top-right" />
      
      {/* Navigation Bar with logo and heading */}
      <div className="Header">
        <h2 className="Header-title">EVENTS BY TOP EVENTS</h2>
        <button className="getevent-btn" onClick={() => navigate("/getevents")}>
          Event List
        </button>
      </div>

      <p className="dashboard-subtitle">Events This Week: {eventsThisWeek}</p>
      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Dashboard;
