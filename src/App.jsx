import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css'
import Home from './pages/Home'

function App() {
  // const [count, setCount] = useState(0)

const App = () => {
  return (
    <BrowserRouter>
      <div
        className="flex flex-col m-0 p-4 max-w-full w-screen h-screen max-h-screen overflow-auto antialiased"
      >
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
