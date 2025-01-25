import React from 'react'
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="relative rounded-3xl flex-1 max-h-full bg-cover bg-center max-w-full"
      style={{ backgroundImage: "url('/bg.svg')" }}
    >
      <div>
        <img
          src="/text.svg" alt="logo"
          className="absolute top-1/5 left-2.5%"
        />
      </div>
      <div className="absolute top-3/5 left-2.5%">
        <button
          onClick={() => navigate("/map")}
          className="border rounded-md p-2 bg-gray-100"
        >Find Nearby Shelter</button>
      </div>
      <div className="absolute right-0 bottom-0">
        <img
          src="/support.svg" alt="support image"
          className="rounded-3xl"
        />
      </div>
    </div>
  )
}

export default Home
