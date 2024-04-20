// import { useState } from 'react';
// import { Button } from 'react-bootstrap';

// const testing = () => {
//   const [loading, setLoading] = useState(false);

//   const sendDataToMongoDB = async () => {
//     try {
//       setLoading(true);

//       // Send a request to the API route
//       const response = await fetch('/api/testingApi', {
//         method: 'POST',
//       });

//       if (response.ok) {
//         console.log('Data stored in MongoDB successfully');
//       } else {
//         console.error('Failed to store data in MongoDB');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <Button className="bg-primary mt-5 ml-5" onClick={sendDataToMongoDB} disabled={loading}>
//         {loading ? 'Storing...' : 'Store To MongoDB'}
//       </Button>
//     </div>
//   );
// };

// export default testing;
