import { useState } from 'react'
import './App.css'
import DesignPattern from './DesignPattern'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DesignPattern/>
    </>
  )
}

export default App
