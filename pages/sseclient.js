import React, { useState, useEffect } from 'react';

const SseDemo = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    //  Corrected API route path
    const eventSource = new EventSource('/api/serverSideEvents/events');

    eventSource.onopen = () => {
      console.log('Connection opened!');
      setLoading(false); //  Set loading to false on open
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      } catch (e) {
        console.error('Error parsing SSE data:', e);
        setError('Error parsing data from server.');
        setLoading(false);
      }
    };

    eventSource.onerror = (event) => {
      console.error('SSE error:', event);
      setError('Error connecting to server.');
      setLoading(false); //  Set loading to false on error
      if (event.target?.readyState === EventSource.CLOSED) {
        console.log('Connection was closed by the server.');
      }
    };

    return () => {
      eventSource.close();
      console.log('Connection closed!');
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>No data yet.</div>;
  }

  return (
    <div>
      <h1>Server-Sent Events Demo</h1>
      <p>Data from server: {JSON.stringify(data)}</p>
    </div>
  );
};

export default SseDemo;