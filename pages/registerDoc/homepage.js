import { Button, Col, Container, Form, Row } from "react-bootstrap"
import { useState } from "react"
import { getSession, signOut } from "next-auth/react"
import AuthenticatedComponent from "../api/auth/authenticatedcomponent"
import { useRouter } from "next/router"

export default function Homepage() {
    const session = getSession();
    const [login, setLogin] = useState(true)
    const router = useRouter()


    const toggle = () => {
        setLogin(!login)
    }

    const handleSignOut = async () => {
        try {
            await signOut();
            // Additional logic after successful sign-out
            router.push('/registerDoc/onload'); // Redirect to the login screen
        } catch (error) {
            console.error('Error during sign-out:', error);
        }
    }

    return (
        <AuthenticatedComponent>
            <div>Welcome</div>
            <button type="button" className="bg-primary" onClick={handleSignOut}>Log out</button>
        </AuthenticatedComponent>
    )
}