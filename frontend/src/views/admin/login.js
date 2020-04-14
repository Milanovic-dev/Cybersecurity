import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import bg from '../../assets/images/login-bg.png';
import LoginForm from '../../components/forms/loginForm';
import {
    Container,
    Row,
    Col
} from 'reactstrap';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.login = this.login.bind(this);
        this.state = {
        };
    }

    login(data) {

        fetch('http://localhost:4000/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: data.username,
                password: data.password
            })
        }).then((res) => res.json()).then((result) => {
            if (!result.error) {
                localStorage.setItem('token', result.token);
                this.props[0].history.push('/tree');
            } else {
                this.setState({
                    error: result.error
                })
            }
        })

        /*
        if (data.type === 'admin') {
            fetch('http://localhost:4000/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password
                })
            }).then((res) => res.json()).then((result) => {
                if (!result.error) {

                    let token = result.token;

                    // fetch('http://localhost:4000/admin/checkPasswordChange', {
                    //     method: 'GET',
                    //     headers: {
                    //         'Authorization': `Bearer ${token}`
                    //     },
                    // }).then((res) => res.json()).then((result) => {

                    //     localStorage.setItem('token', token);
                    //     this.props[0].history.push('/admin/changePassword')
                    // })
                    this.props[0].history.push('/tree');
                } else {
                    this.setState({
                        error: result.error
                    })
                }
            })
        }else if (data.type === 'clinicAdmin'){
            fetch('http://localhost:4000/clinic/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password
                })
            }).then((res) => res.json()).then((result) => {
                if (!result.error) {
                    let token = result.token;

                    // fetch('http://localhost:4000/admin/checkPasswordChangeCA', {
                    //     method: 'GET',
                    //     headers: {
                    //         'Authorization': `Bearer ${token}`
                    //     },
                    // }).then((res) => res.json()).then((result) => {

                        
                    //     localStorage.setItem('clinicAdminToken', token);
                    //     if (result.required){
                    //         this.props[0].history.push('/admin/changePasswordCA');

                    //     }else{
                    //         this.props[0].history.push('/clinic/users');
   
                    //     }

                       
                    // })
                    this.props[0].history.push('/tree');
                } else {
                    this.setState({
                        error: result.error
                    })
                }
            })
    
        }else if (data.type === 'clinicUser'){
            fetch('http://localhost:4000/clinic/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password
                })
            }).then((res) => res.json()).then((result) => {
                if (!result.error) {
                    let token = result.token;

                    // fetch('http://localhost:4000/admin/checkPasswordChangeDoc', {
                    //     method: 'GET',
                    //     headers: {
                    //         'Authorization': `Bearer ${token}`
                    //     },
                    // }).then((res) => res.json()).then((result) => {

                        
                    //     localStorage.setItem('clinicUserToken', token);
                    //     if (result.required){
                    //         this.props[0].history.push('/doctor/changePassword');

                    //     }else{
                    //         this.props[0].history.push('/doctor');
   
                    //     }

                       
                    // })
                    this.props[0].history.push('/tree');
                } else {
                    this.setState({
                        error: result.error
                    })
                }
            })
    
        }else if (data.type === 'patient'){
            fetch('http://localhost:4000/patient/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: data.username,
                    password: data.password
                })
            }).then((res) => res.json()).then((result) => {
                if (!result.error) {
                    localStorage.setItem('patientToken', result.token);
                    this.props[0].history.push('/patient');
                } else {
                    this.setState({
                        error: result.error
                    })
                }
            })
    
        }
        */

    }



    render() {

        return (
            <div className="login-page">
                {
                    (localStorage.token) ? <Redirect to='/tree' /> : null
                }
                <Container className="block-wrap">
                    <Row>
                        <Col lg="12">
                            <Container>
                                <Row className="login-container">
                                    <Col lg="6" xs="12" className="login-bg">
                                        <img src={bg} />
                                    </Col>
                                    <Col lg="6" xs="12" className="login-form">
                                        <Container>
                                            <Row>
                                                <Col lg="12">
                                                    <h3>Prijava</h3>
                                                    <h6></h6>
                                                </Col>
                                            </Row>
                                            <LoginForm onSubmit={this.login} />
                                            {
                                                this.state.error ?
                                                    <p>{this.state.error}</p>
                                                    :
                                                    null
                                            }

                                        </Container>
                                    </Col>
                                </Row>
                            </Container>
                        </Col>
                    </Row>
                </Container>
            </div >
        );
    }
}

export default LoginPage;