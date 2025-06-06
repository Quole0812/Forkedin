import { Outlet } from 'react-router-dom'
import Header from './components/Header.jsx'
import React from 'react';


function App() {
  return ( 
    <>
      <Header />
      <main style={{ marginTop: '4rem' }}>
        <Outlet />
      </main>
    </>
  )
}

export default App