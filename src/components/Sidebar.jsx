import React from 'react'

function Sidebar({ className, ...props}) {
  return (
    <div
      className={`${className} `}
      {...props}
    >
      Sidebar!
    </div>
  )
}

export default Sidebar
