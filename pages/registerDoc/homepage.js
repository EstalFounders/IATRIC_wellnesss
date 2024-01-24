import { Button, Col, Container, Form, Row } from "react-bootstrap"
import { useState } from "react"
import { getSession, signOut } from "next-auth/react"
import AuthenticatedComponent from "../api/auth/authenticatedcomponent"
import { useRouter } from "next/router"
import DocLoginHeader from "../../src/layout/Header/DocLoginHeader"
import Navbar from "../../src/components/registerDocComponent/NavBarComponent/Navbar"
import Layouts from "../../src/layout/Layouts"

export default function Homepage() {
    const session = getSession();
    const [login, setLogin] = useState(true)
 

    const toggle = () => {
        setLogin(!login)
    }



    return (
        <AuthenticatedComponent>
        <Layouts header={7} footer={7}>
        <Navbar />
        </Layouts>
         </AuthenticatedComponent>
    )
}