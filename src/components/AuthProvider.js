'use client'

import {SessionProvider} from 'next-auth';

const AuthProvider = ({children, session}) => {
   return(
    <div>
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    </div>
   )
}