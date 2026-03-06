import React from 'react'

const Spinner = () => {
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', minHeight: '100vh'}}>
      <div style={{textAlign: 'center'}}>
        <p style={{fontSize: '1rem', color: '#374151'}}>Loading...</p>
      </div>
    </div>
  )
}

export default Spinner