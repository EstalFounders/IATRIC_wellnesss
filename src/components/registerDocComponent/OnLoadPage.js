import { Button, Col, Row } from "react-bootstrap"
import DocLoginHeader from "../../layout/Header/DocLoginHeader"
import Login from "../registerDocComponent/Login"
import SignUp from "./SignUp"
import { useState } from "react"




export default function OnloadPage() {
    const [login, setLogin] = useState(true)
    const toggle = () => {
        setLogin(!login)
    }

    return (
        <Row>
            <Col>
                {/* doctor header login */}
                <Row>
                    <Col>
                        <DocLoginHeader />
                    </Col>
                </Row>

                <Row className="text-center mt-2">
                    <Col>
                        <Button variant="secondary" className="text-secondary border m-1" onClick={toggle}><strong><b>Login</b></strong></Button>
                        <Button variant="success" className="text-success border" onClick={toggle}><strong><b>SignUp</b></strong></Button>
                    </Col>
                </Row>

                {/* login form for doctor */}
                <Row>
                    <Col>
                        {login ? <Login /> : <SignUp />}
                    </Col>
                </Row>

            </Col>
        </Row>
    )
}