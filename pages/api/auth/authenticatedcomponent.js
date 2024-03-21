import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const AuthenticatedComponent = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      console.log(session, 'session in AuthenticatedComponent');

      if (!session) {
        // Redirect to the login page or show an authentication prompt
        router.push('/superAdmin/onload');
      }
    };

    checkSession();
  }, [router]);

  // Render the component if the user is authenticated
  return <>{children}</>;
};

export default AuthenticatedComponent;