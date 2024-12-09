'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const DynamicClock = dynamic(() => import('./DynamicClock'), {
  ssr: false
})

export default DynamicClock 