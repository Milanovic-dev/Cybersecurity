import React, { Component } from 'react';
import Page from '../../containers/admin/page';
import Form from '../../components/forms/exampleForm';

import {
    Container,
    Row,
    Col,
} from 'reactstrap';

class ExampleFormPage extends Component {
    constructor(props) {
        super(props);
        this.add = this.add.bind(this);
        this.state = {

        };
    }

    add(data) {
        console.log(data);

        fetch('http://127.0.0.1:4000/admin/medications/' + this.props[0].match.params.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        }).then((res) => res.json()).then((result) => {
            if (result.error) {
                this.setState({
                    error: result.error
                })
                return;
            }
            this.props[0].history.push('/admin/medications')
        })
    }

    componentDidMount() {
        if (this.props[0].match.params.id !== 'new') {
            fetch('http://127.0.0.1:4000/admin/medications/' + this.props[0].match.params.id, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`

                }
            }).then((res) => res.json()).then((result) => {
                this.setState({
                    initialValues: result
                })
                console.log(result);
            })

        }
    }


    render() {
        return (
            <div className="page-wrap">
                <Container fluid>
                    <Row className="page-title">
                        <Col lg="12">
                            {this.props[0].match.params.id !== 'new' ? <h3>Edit</h3> : <h3>Create</h3>}
                        </Col>
                    </Row>
                    {this.state.initialValues ?
                        <Form initialValues={this.state.initialValues} onSubmit={this.add} /> //ClinicForm
                        :
                        <Form onSubmit={this.add} />
                    }
                    {
                        this.state.error ?

                            <p>{this.state.error}</p>
                            :
                            null
                    }
                </Container>
            </div>
        );
    }
}

export default Page(ExampleFormPage);