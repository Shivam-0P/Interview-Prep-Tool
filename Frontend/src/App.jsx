import { Route, Routes } from 'react-router-dom'
import Register from './Component/Register'
import Login from './Component/Login'
import Frontpage from './Component/Frontpage'
import Preppage from './Component/Preppage'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Frontpage/>} />
      <Route path="/Frontpage" element={<Frontpage/>} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
       <Route path="/prep" element={<Preppage />} />
    </Routes>
  )
}

export default App
