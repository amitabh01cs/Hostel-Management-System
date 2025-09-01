import { useState, useEffect } from 'react';
import { formatDate, generateSerialNumber } from '../lib/utils/dateUtils';


export function useGatePass() {
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // Initialize the serial number and current date
    setSerialNumber(generateSerialNumber());
    setCurrentDate(formatDate(new Date()));
  }, []);

  return {
    serialNumber,
    currentDate
  };
}
