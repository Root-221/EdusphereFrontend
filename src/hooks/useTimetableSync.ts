import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useTimetableSync(schoolId: string | undefined, onUpdate: () => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!schoolId) return;

    // Use current origin but assume backend is running on /api/v1 (or on the same host but different port in dev)
    // We can use the environment variable if available, or just fallback to proxy target.
    // Assuming backend runs on same domain or we have a proxy setup.
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    socketRef.current = io(apiUrl);

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('joinSchool', schoolId);
    });

    socketRef.current.on('timetable:updated', () => {
      onUpdate();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveSchool', schoolId);
        socketRef.current.disconnect();
      }
    };
  }, [schoolId, onUpdate]);
}
