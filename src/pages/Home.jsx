import React from 'react'
import { useNavigate } from 'react-router';

function Home() {
  const navigate = useNavigate();
  
  return (
    <div
      className="relative rounded-3xl flex-1 max-h-full bg-cover bg-center max-w-full"
      style={{ backgroundImage: "url('/bg.svg')" }}
    >
      <div className="absolute top-1/5 left-2.5% z-10">
        <img
          src="/text.svg" alt="logo"
          className=""
        />
      </div>
      <div className="absolute top-3/5 left-2.5% z-10">
        <button
          onClick={() => navigate("/resources")}
          className="border rounded-md p-2 bg-gray-100"
        >Find Nearby Shelter</button>
      </div>
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain m-auto z-0"
      >
        <img
          height={720}
          width={720}
          src="/firefightinganteater.webp"
          alt="fire fighting anteater"
          className="rounded-3xl h-full"
        />
      </div>
      <div className="absolute right-0 bottom-0 z-10">
        <img
          src="/support.svg" alt="support image"
          className="w-96"
        />
      </div>
    </div>
  )
}

export default Home
