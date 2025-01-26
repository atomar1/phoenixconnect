import React, { useState, useEffect } from 'react'
import axios from 'axios';

function Login() {
  const [data, setData] = useState({
    "username": "",
    "password": "",
  });
  const dbUrl = "http://localhost:5000"

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const resp = await axios.post(`${dbUrl}/login`, {
        username: data.username,
        password: data.password,
      });
      console.log(resp.data);
    } catch (err) { 
      console.log(err);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4"
    >
      <input
        type="text"
        name="username"
        placeholder="Enter username"
        value={data.title}
        onChange={handleChange}
        className="border rounded-md w-1/3 p-2"
      />
      <input
        type="password"
        name="password"
        placeholder="Enter password"
        value={data.title}
        onChange={handleChange}
        className="border rounded-md w-1/3 p-2"
      />
      <button
        type="submit"
        className="border rounded-md p-2 border-brand-red text-gray-600 bg-gray-100"
      >
        Submit
      </button>
    </form>
  )
}

export default Login
