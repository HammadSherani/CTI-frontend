'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/config/axiosInstance';

let request = null;
const load = () => {
  request ||= axiosInstance.get('/public/return-policy')
    .then(({ data }) => data.data)
    .catch(() => { request = null; return null; });
  return request;
};

/** The return period set on the server, { ms, label } after delivery. null until known. */
export default function useReturnWindow() {
  const [period, setPeriod] = useState(null);
  useEffect(() => {
    let gone = false;
    load().then((value) => { if (!gone && value !== null) setPeriod(value); });
    return () => { gone = true; };
  }, []);
  return period;
}
