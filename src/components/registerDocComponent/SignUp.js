import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import axios from 'axios';
import Preloader from "../Preloader";
import { loginUser } from "../../helper";
import { useRouter } from "next/router";


export default function SignUp() {
    const [cpassword, setCPassword] = useState()
    const [gender, setGender] = useState()
    const [loader, setLoader] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        fname: '', lname: '', country: '',
        mobNo: '', email: '', password: '',
        date: new Date(), dob: '', gender: ''

    });


    const onChange = (e) => {
        { e.target.name.includes('fname') ? setFormData({ ...formData, fname: e.target.value }) : '' }
        { e.target.name.includes('lname') ? setFormData({ ...formData, lname: e.target.value }) : '' }
        { e.target.name.includes('MobNo') ? setFormData({ ...formData, mobNo: e.target.value }) : '' }
        { e.target.name.includes('Email') ? setFormData({ ...formData, email: e.target.value }) : '' }
        { e.target.name.includes('Password') ? setFormData({ ...formData, password: e.target.value }) : '' }
        { e.target.name.includes('ConfirmPass') ? setCPassword(e.target.value) : '' }
        { e.target.name.includes('Dob') ? setFormData({ ...formData, dob: e.target.value }) : '' }
        { e.target.name.includes('flexRadioDisabled') ? setFormData({ ...formData, gender: e.target.value }) : '' }
    }


    const sumitSignup = async () => {

        if (formData.password != cpassword)
            return alert('password is not matching')

        if (formData.fname == '' || formData.lname == '' || formData.mobNo == '' || formData.email == '' || formData.password == '' || cpassword == '' || formData.dob == '' || formData.gender == '')
            return alert('Please fill the field to continue')

        setLoader(true)
        try {
            const Body = JSON.stringify(formData)
            const createdUser = await axios.post('/api/signup', {
                headers: {
                    'Content-Type': 'application/json',
                },
                body: Body
            })
                .then((response) => {
                    setLoader(false)
                    console.log(response, 'respone in then')

                    if (response.status === 200) {
                        console.log("SUCCESSS", response)
                        alert('Congratulation! You have registered with us, Please login to continue')
                    } else {

                    }
                    setLoader(false)
                })

        } catch (error) {
            console.log(error, 'error in console')
            if (error.response.status === 409) {
                console.log("User already existed")
                setLoader(false)
                alert('Email already existed')
            } else {
                alert(error)
            }

        }
        setFormData({ ...formData, fname: '', lname: '', country: '', mobNo: '', password: '', dob: '', gender: '' })
        document.getElementById("signupForm").reset()
    }

    return (
        <Container className="mb-4">
            {loader && <Preloader />}
            <Row className="text-center">
                <Col md={5} className="mt-2 border border-info rounded ml-auto mr-auto p-4" style={{ backgroundColor: '#f5d49a' }}>
                    <Form id="signupForm">
                        <Row>
                            <Col>
                                <Form.Group className="m-2" controlId="formBasicFname">
                                    <Form.Control type="text" placeholder="First name" onChange={onChange} name="setfname" />
                                </Form.Group>
                            </Col>

                            <Col>
                                <Form.Group className="m-2" controlId="formBasicLname">
                                    <Form.Control type="text" placeholder="Last name" onChange={onChange} name="setlname" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <CountryDropdown
                                    value={formData.country}
                                    className="m-2 py-2 w-75"
                                    onChange={(value) => setFormData({ ...formData, country: value })}
                                    name="selectCountry"

                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="m-2" controlId="formBasicMobileNo">
                                    <Form.Control type="number" placeholder="Mobile no" name="setMobNo" onChange={onChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Form.Group className="m-2" controlId="formBasicEmail">
                                    <Form.Control type="email" placeholder="Enter email" name="setEmail" onChange={onChange} />
                                </Form.Group>
                            </Col>

                            <Col>
                                <Form.Group className="m-2" controlId="formBasicRefCode">
                                    <Form.Control type="password" placeholder="referel code" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Form.Group className="m-2" controlId="formBasicPass">
                                    <Form.Control type="password" placeholder="Password" name="setPassword" onChange={onChange} />
                                </Form.Group>
                            </Col>

                            <Col>
                                <Form.Group className="m-2" controlId="formBasicConfirmPassword">
                                    <Form.Control type="password" placeholder="Confirm Password" name="ConfirmPass" onChange={onChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col>
                                <Form.Label style={{ fontFamily: 'sans-serif' }}><strong>Please select your Date of birth</strong></Form.Label>
                                <Form.Control
                                    type="date"
                                    name="setDob"
                                    placeholder="DateRange"
                                    value={formData.dob}
                                    onChange={onChange}
                                />
                            </Col>
                        </Row>
                        <Row className="m-2" onChange={onChange}>
                            <Col><b>Gender</b></Col>
                            <Col>
                                <input className="form-check-input" type="radio" name="flexRadioDisabled" value="Male" />
                                <label className="form-check-label" htmlFor="Gender">
                                    Male
                                </label>
                            </Col>
                            <Col>
                                <input className="form-check-input" type="radio" name="flexRadioDisabled" value="Female" />
                                <label className="form-check-label" htmlFor="Gender">
                                    Female
                                </label>
                            </Col>
                        </Row>
                        <Button variant="primary" type="button" className="bg-primary mt-4" onClick={sumitSignup} disabled={loader}>
                            Sign up
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}