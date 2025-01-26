import React from 'react'

function Footbar() {
  return (
    <footer className="flex flex-col items-center py-4">
      <p>&copy; {new Date().getFullYear()} IrvineHacks. All rights reserved.</p>
      <p>Team members: Ansh, Claire, Kary, Ivan</p>
    </footer>
  )
}

export default Footbar
