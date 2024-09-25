import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import InvoiceGenerator from './pages/InvoiceGenerator'
import Invoice_Generator from './pages/Invoice_Generator'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Invoice_Generator/>
      </div>
    </>
  )
}

export default App
