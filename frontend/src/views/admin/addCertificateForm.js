import React, { Component } from 'react';
import Page from '../../containers/admin/page';
import Form from '../../components/forms/addCertificate';
import {
    Container,
    Row,
    Col,
} from 'reactstrap';



class addCertificateForm extends Component {
    constructor(props) {
        super(props);
        this.add = this.add.bind(this);
        this.state = {

        };
    }

    add(data){
        data.serialNumber = 1;
        console.log(data);
        let url = this.props[0].match.params.parentId ? 'http://127.0.0.1:4000/certificate/create/' + this.props[0].match.params.parentId : 'http://127.0.0.1:4000/certificate/createRoot';
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        }).then((res) => res.json()).then((result) => {
            console.log(result);
        });
    }

    render() {
        return (
            <div className="page-wrap">
                <Container fluid>
                    <Row className="page-title">
                        <Col lg="12">
                        </Col>
                    </Row>
                        <Form isRoot={!this.props[0].match.params.parentId} onSubmit={this.add} />
                </Container>
            </div>
        );
    }
}

export default Page(addCertificateForm);