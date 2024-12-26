import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doctor_info_local_storage, super_admin_info_local_sotrage } from '../../../src/constant';

const AuthenticatedComponent = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      console.log(session, 'session in AuthenticatedComponent');
      if (session) {
        sessionStorage.setItem(super_admin_info_local_sotrage, JSON.stringify(session));
        setLoading(false); // Stop loading once the session is set
      } else {
        // Redirect to the doctor login page if not authenticated
        router.push('/superAdmin/onload');
      }
    };

    checkSession();
  }, [router]);

  // Render the component if the user is authenticated
  return <>{children}</>;
};

export default AuthenticatedComponent;