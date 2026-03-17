'use client';

import { useEffect, useState } from 'react';

/** Reloj actualizado cada segundo para la barra del POS. */
export function usePOSClock() {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return currentTime;
}
