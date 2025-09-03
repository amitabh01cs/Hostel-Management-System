import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Yeh React Router ka hook hai
import { logActivity } from '../lib/logger';

const PageTracker = () => {
  const location = useLocation(); // Yeh hook aapko batata hai ki user abhi kaun se URL par hai

  useEffect(() => {
    // Yeh useEffect tab-tab chalega jab bhi user ka URL (page) badlega
    logActivity('PAGE_VIEW');
  }, [location]); // [location] ka matlab hai ki "jab bhi location badle, is code ko chalao"

  // Yeh component screen par kuch nahi dikhata, iska kaam bas tracking karna hai
  return null;
};

export default PageTracker;
