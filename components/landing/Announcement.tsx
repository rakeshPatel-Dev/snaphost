import React from 'react'
import { Badge } from '../ui/badge';

export const Announcement = () => {
  return (
    <span className="font-semibold text-foreground inline"  >
      SnapHost 
      <Badge variant="outline" className="ml-2 font-semibold bg-green-100 text-green-600 border-2 border-black ">
        Beta
      </Badge>
    </span>
  )
}

export default Announcement
