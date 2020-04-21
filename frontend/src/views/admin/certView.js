import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom';
import Isvg from 'react-inlinesvg';
import Page from '../../containers/admin/page';
import CertViewForm from '../../components/forms/certViewForm';

import {
    Container,
    Row,
    Col,
} from 'reactstrap';

class CertView extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }
    componentDidMount() {
        console.log(this.props[0].match.params.id);

        fetch('https://localhost:4000/certificate/getOne/' + this.props[0].match.params.id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        }).then((res) => res.json()).then((result) => {
            console.log("rez: "); 
            console.log(result);
            this.setState({
                initialValues: result
            })
        })



    }

    render() {
        return (
            <div className="page-wrap">
                {
                    !localStorage.token ? <Redirect to='/login' /> : null
                }
                
                {
                    this.state.initialValues ?
                        <CertViewForm initialValues={this.state.initialValues} />
                        : null
                }
            </div>
        )
    }
}

export default Page(CertView)
