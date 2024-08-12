import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doctor_info_local_storage, super_admin_info_local_sotrage } from '../../../src/constant';

const DoctorAuthenticatedComponent = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      console.log(session, 'session in DoctorAuthenticatedComponent');
      if (session) {
        localStorage.setItem(doctor_info_local_storage, JSON.stringify(session));
        setLoading(false); // Stop loading once the session is set
      } else {
        // Redirect to the doctor login page if not authenticated
        router.push('/registerDoc/login');
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Display a loading message while waiting for the session
  }

  // Render the component if the user is authenticated and has the doctor role
  return <>{children}</>;
};

export default DoctorAuthenticatedComponent;
