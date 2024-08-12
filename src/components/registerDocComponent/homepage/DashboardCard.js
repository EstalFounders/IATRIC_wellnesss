import React from 'react';

const DashboardCard = ({ title, value, backgroundColor }) => {
  return (
    <div
      style={{
        backgroundColor,
        padding: '20px',
        borderRadius: '10px',
        color: '#fff',
        flex: '1 1 30%',
        margin: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h3>{title}</h3>
      <p><b>{value}</b></p>
    </div>
  );
};

export default DashboardCard;
