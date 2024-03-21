import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { loginUser } from "../../helper";
import { useRouter } from "next/router";
import Preloader from "../Preloader";


export default function Login() {
    const [loader, setLoader] = useState(false)
    const router = useRouter()
    const [loginErr, setLoginErr] = useState()
    const [userInfo, setUserInfo] = useState({ email: '', password: '' })

    const loginDoc = async () => {
        setLoader(true)

        const loginRes = await loginUser({
            email: userInfo.email,
            password: userInfo.password
        })

        console.log(loginRes.ok, 'login resp')

        if (loginRes && !loginRes.ok) {
            setLoginErr('Please check your password & email')
        } else {
            setLoader(false)
            router.push('/superAdmin/homepage')
        }
      
    }

    return (
        <Container>
            {loader && <Preloader />}
            <Row className="text-center">
                <Col md={3} className="mt-2 border border-info rounded ml-auto mr-auto p-4" style={{ backgroundColor: '#f5d49a' }}>
                    <Form>
                        <Form.Group className="mb-1" controlId="formBasicEmail">
                            <Form.Label><b><strong>Email address</strong></b></Form.Label>
                            <Form.Control type="email" placeholder="Enter email" onChange={event => setUserInfo({ ...userInfo, email: event.target.value })} />
                            <Form.Text className="text-muted">
                                <strong>
                                    We will never share your email with anyone else.
                                </strong>
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-1" controlId="formBasicPassword">
                            <Form.Label><b><strong>Password</strong></b></Form.Label>
                            <Form.Control type="password" placeholder="Password" onChange={event => setUserInfo({ ...userInfo, password: event.target.value })} />
                        </Form.Group>
                        {/* <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="Check me out" />
                    </Form.Group> */}
                        <Button variant="primary" type="button" className="bg-primary mt-4" onClick={loginDoc}>
                            Login
                        </Button>
                    </Form>
                    <Row className="mt-2">
                        <Col className="text-center text-danger">
                        <b>{loginErr}</b>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    )
}