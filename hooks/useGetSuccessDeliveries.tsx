'use client'

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { getSocket } from '@/lib/socket'

interface SocketPayload<T> {
  date: string
  data: T
}

export function useGetSuccessDeliveries<T>(
  date: Date | undefined,
  onUpdate: (data: T) => void
) {
  const onUpdateRef = useRef(onUpdate)
  
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!date) return

    const socket = getSocket()

    const token = localStorage.getItem('token')
    if (!token) {
      console.error('❌ No token found for socket')
      return
    }

    socket.auth = { token }

    if (!socket.connected) {
      socket.connect()
    }

    const formattedDate = format(date, 'yyyy-MM-dd')

    socket.emit('join:date', formattedDate)

    const handler = (payload: SocketPayload<T>) => {
      if (payload.date === formattedDate) {
        onUpdateRef.current(payload.data)
      }
    }

    socket.on('delivery:update', handler)

    return () => {
      socket.emit('leave:date', formattedDate)
      socket.off('delivery:update', handler)
    }
  }, [date])
}
