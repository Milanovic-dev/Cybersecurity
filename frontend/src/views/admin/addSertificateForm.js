import React, { Component } from 'react';
import Page from '../../containers/admin/page';
import Form from '../../components/forms/addSertificate';
import {
    Container,
    Row,
    Col,
} from 'reactstrap';

class addSertificateForm extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    render() {
        return (
            <div className="page-wrap">
                <Container fluid>
                    <Row className="page-title">
                        <Col lg="12">
                        </Col>
                    </Row>
                        <Form onSubmit={this.add} />
                </Container>
            </div>
        );
    }
}

export default Page(addSertificateForm);