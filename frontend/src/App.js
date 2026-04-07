import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    destination: "",
    budget: "",
    days: "",
    preferences: ""
  });

  const [itinerary, setItinerary] = useState(null);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  // 🔹 Load history
  useEffect(() => {
    const saved = localStorage.getItem("tripHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 Generate Trip
  const generateTrip = async () => {
    const res = await fetch("http://127.0.0.1:8000/plan-trip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        destination: form.destination,
        budget: Number(form.budget),
        days: Number(form.days),
        preferences: form.preferences
      })
    });

    const data = await res.json();
    setItinerary(data.itinerary);

    // Save history
    const updatedHistory = [data.itinerary, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("tripHistory", JSON.stringify(updatedHistory));

    // Reset chat
    setMessages([
      { role: "ai", content: "Trip generated! You can modify it below." }
    ]);
  };

  // 💬 Chat modify
  const sendMessage = async () => {
    if (!userInput) return;

    const newMessages = [
      ...messages,
      { role: "user", content: userInput }
    ];
    setMessages(newMessages);

    const res = await fetch("http://127.0.0.1:8000/modify-trip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        itinerary: itinerary,
        user_input: userInput
      })
    });

    const data = await res.json();

    if (data.updated_itinerary) {
      setItinerary(data.updated_itinerary);

      setMessages([
        ...newMessages,
        { role: "ai", content: "Itinerary updated ✅" }
      ]);
    }

    setUserInput("");
  };

  return (
    <div className="hero">
      <h1 className="title">Your Perfect Trip Awaits ✈️</h1>

      {/* FORM */}
      <div className="card">
        <input name="destination" placeholder="Destination" onChange={handleChange} />
        <input name="budget" placeholder="Budget (₹)" onChange={handleChange} />
        <input name="days" placeholder="Days" onChange={handleChange} />
        <input name="preferences" placeholder="Preferences" onChange={handleChange} />

        <button onClick={generateTrip}>Plan My Trip</button>
      </div>

      {/* HISTORY */}
      {history.length > 0 && (
        <div className="history">
          <h3>Previous Trips</h3>

          {history.map((trip, i) => (
            <div
              key={i}
              className="historyItem"
              onClick={() => setItinerary(trip)}
            >
              {trip.destination} — ₹{trip.total_cost}
            </div>
          ))}

          <button
            className="clearBtn"
            onClick={() => {
              localStorage.removeItem("tripHistory");
              setHistory([]);
            }}
          >
            Clear History
          </button>
        </div>
      )}

      {/* RESULT */}
      {itinerary && (
        <div className="result">
          <h2>{itinerary.destination}</h2>
          <h3>₹{itinerary.total_cost}</h3>

          {itinerary.days.map((day) => (
            <div key={day.day} className="dayCard">
              <h4>Day {day.day}: {day.title}</h4>
              <ul>
                {day.activities.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* 💬 CHAT UI */}
          <div className="chatBox">
            <div className="chatMessages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={msg.role === "user" ? "chat userMsg" : "chat aiMsg"}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="chatInput">
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Make it cheaper, add adventure..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;