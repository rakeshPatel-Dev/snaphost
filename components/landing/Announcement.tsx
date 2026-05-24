import React from 'react'
import { Badge } from '../ui/badge';

export const Announcement = () => {
  return (
    <span className="font-semibold text-foreground inline"  >
      SnapHost 
      <Badge variant="outline" className="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 border border-green-200 animate-pulse">
        Beta
      </Badge>
    </span>
  )
}

export default Announcement
