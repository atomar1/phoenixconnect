import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css'
import Home from './pages/Home'
import Community from './pages/Community'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div
        className="flex flex-col m-0 p-4 max-w-full w-screen h-screen max-h-screen overflow-auto antialiased"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<Community />}/>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
