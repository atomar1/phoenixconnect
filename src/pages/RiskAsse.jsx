import React, { useState } from "react";
import axios from "axios";

const RiskAssessmentPage = () => {
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [result, setResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = () => {
    const severityLevels = ["Low", "Moderate", "High"];
    const fireSpreadRisk = ["Low", "Medium", "High"];
    const safetyTips = [
      "Evacuate the area if possible.",
      "Keep fire extinguishers ready.",
      "Call emergency services immediately.",
      "Avoid inhaling smoke; use a mask.",
    ];

    const randomSeverity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    const randomFireRisk = fireSpreadRisk[Math.floor(Math.random() * fireSpreadRisk.length)];
    const randomWeather = `Temperature: ${Math.floor(Math.random() * 20) + 20}°C, Wind: ${Math.floor(Math.random() * 15) + 5} km/h`;

    setResult({
      severity: randomSeverity,
      fireRisk: randomFireRisk,
      weather: randomWeather,
      safetyTips,
    });
  };

  const sendMessageToPeter = async () => {
    if (!userInput) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    
    setUserInput("");

    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        prompt: userInput,
        max_tokens: 150,
      }, {
        headers: {
          "Authorization": `Bearer `,
          "Content-Type": "application/json"
        }
      });

      const botMessage = response.data.choices[0].text.trim();
      setChatMessages((prev) => [...prev, { sender: "peter", text: botMessage }]);
    } catch (error) {
      console.error("Error communicating with OpenAI:", error);
      setChatMessages((prev) => [...prev, { sender: "peter", text: "Sorry, I couldn't respond at the moment." }]);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Risk Assessment</h1>
      
      {/* Upload & Location Form */}
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <label className="block mb-4">
          <span className="text-gray-700">Upload Fire Image:</span>
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-red file:text-white hover:file:bg-brand-red/90"
            onChange={handleImageUpload}
          />
        </label>
        <label className="block mb-4">
          <span className="text-gray-700">Enter Location:</span>
          <input
            type="text"
            placeholder="e.g., San Francisco, CA"
            className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        <button
          className="w-full bg-brand-red text-white py-2 rounded-lg font-semibold hover:bg-brand-red/90"
          onClick={handleAnalyze}
        >
          Analyze
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-4">Analysis Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Severity */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-2">Severity of Damage</h3>
              <p className="text-gray-600">{result.severity}</p>
            </div>

            {/* Card 2: Fire Spread Risk */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-2">Risk of Fire Spread</h3>
              <p className="text-gray-600">{result.fireRisk}</p>
            </div>

            {/* Card 3: Weather Details */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-2">Weather Conditions</h3>
              <p className="text-gray-600">{result.weather}</p>
            </div>

            {/* Card 4: Safety Tips */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold mb-2">Safety Recommendations</h3>
              <ul className="list-disc pl-6 text-gray-600">
                {result.safetyTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Show Uploaded Image */}
      {image && (
        <div className="mt-8 text-center">
          <h3 className="text-lg font-bold mb-2">Uploaded Image:</h3>
          <img src={image} alt="Uploaded Fire" className="max-w-full rounded-lg shadow-md" />
        </div>
      )}

      {/* Chatbot Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Chat with Peter</h2>
        <div className="max-h-60 overflow-y-auto mb-4">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
              <span className={`inline-block p-2 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Ask Peter anything..."
          className="block w-full rounded-lg border-gray-300 shadow-sm mb-2"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              sendMessageToPeter();
            }
          }}
        />
        <button
          className="w-full bg-brand-red text-white py-2 rounded-lg font-semibold hover:bg-brand-red/90"
          onClick={sendMessageToPeter}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default RiskAssessmentPage;
