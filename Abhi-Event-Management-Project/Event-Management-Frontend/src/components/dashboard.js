import React, { useState, useEffect } from "react";
import EventList from "./eventlist";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "./dashboard.css";

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardAndEvents = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [events, setEvents] = useState([]);
  const [eventsThisWeek, setEventsThisWeek] = useState(0);
  const [tomorrowEvents, setTomorrowEvents] = useState([]);
  const [chartData, setChartData] = useState(null);
  useEffect(() => {
    if (activeTab === "Dashboard") {
      document.body.classList.add("add-event-background");
    } else {
      document.body.classList.remove("add-event-background");
    }
  
    return () => {
      document.body.classList.remove("add-event-background");
    };
  }, [activeTab]);
  
  // Fetch events data for Dashboard
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/events");
        const allEvents = response.data;
        setEvents(allEvents);

        // Calculate start and end of the current week
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        // Filter events for the current week
        const thisWeekEvents = allEvents.filter((event) => {
          const eventDate = new Date(event.dateandtime);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });
        setEventsThisWeek(thisWeekEvents.length);

        // Calculate chart data for the week
        const weeklyData = Array(7).fill(0);
        thisWeekEvents.forEach((event) => {
          const eventDate = new Date(event.dateandtime);
          const dayIndex = (eventDate.getDay() + 6) % 7; // Map Sunday (0) to last (6)
          weeklyData[dayIndex]++;
        });

        setChartData({
          labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              label: "Events This Week",
              data: weeklyData,
              backgroundColor: "#4CAF50",
            },
          ],
        });

        // Get tomorrow's events
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(23, 59, 59, 999);

        const tomorrowEvents = allEvents.filter((event) => {
          const eventDate = new Date(event.dateandtime);
          return eventDate >= tomorrow && eventDate <= tomorrowEnd;
        });
        setTomorrowEvents(tomorrowEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Events This Week",
      },
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1, // Ensure the y-axis uses whole numbers
          beginAtZero: true, // Start the y-axis at zero
        },
      },
    },
  };
  

  return (
    <div className="tabs-container">
     <header className="tabs-header">
  {activeTab === "Events" && (
    <button
      className="active"
      onClick={() => setActiveTab("Dashboard")}
    >
      Dashboard
    </button>
  )}
  {activeTab === "Dashboard" && (
    <button
      className="active"
      onClick={() => setActiveTab("Events")}
    >
      Events list
    </button>
  )}
</header>

      <div className="tab-content">
        {activeTab === "Dashboard" && (
          <div className="dashboard">
            <h2>Dashboard</h2>
            <h3>
              <strong>Number of Events This Week: {eventsThisWeek}</strong>
            </h3>
            <div className="chart-container">
              {chartData && <Bar data={chartData} options={chartOptions} />}
            </div>
            <div className="tomorrow-notifications">
              <h3>Tomorrow's Events</h3>
              {tomorrowEvents.length > 0 ? (
                <ul>
                  {tomorrowEvents.map((event) => (
                    <li key={event.event_id}>
                      {event.event_name} at{" "}
                      {new Date(event.dateandtime).toLocaleTimeString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No events scheduled for tomorrow.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "Events" && <EventList />}
      </div>
    </div>
  );
};

export default DashboardAndEvents;
