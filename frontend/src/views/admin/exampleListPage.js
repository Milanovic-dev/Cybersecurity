import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Isvg from 'react-inlinesvg';
import Page from '../../containers/admin/page';

import editIcon from '../../assets/svg/edit.svg';
import deleteIcon from '../../assets/svg/delete.svg';
import adminIcon from '../../assets/svg/admin.svg';


import {
    Container,
    Row,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle
} from 'reactstrap';

class ExampleListPage extends Component {
    constructor(props) {
        super(props);
        this.get = this.get.bind(this);
        this.delete = this.delete.bind(this);

        this.state = {
            items: []
        };
    }

    componentDidMount() {
        this.get();
    }

    get() {
        if (!localStorage.token) {
            return;
        }

        fetch('http://127.0.0.1:4000/admin/medications', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        }).then((res) => res.json()).then((result) => {
            this.setState({
                items: result
            })
        })

    }

    delete(id) {
        if (!localStorage.token) {
            return;
        }

        fetch('http://127.0.0.1:4000/admin/medications/' + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`

            },
        }).then((res) => this.get())
    }

    render() {

        return (
            <div className="page-wrap">
                {
                    /*!localStorage.token ? <Redirect to='/login' /> : null*/
                }

                <Container fluid className="table">

                    <Row className="page-title">
                        <Col lg="12">
                            <h3>Lista lijekova</h3>
                        </Col>
                    </Row>
                    <Row className="table-head">
                        <Col lg="9">
                            <span className="name">NAZIV</span>
                        </Col>
                        <Col lg="3" className="actions">

                            <span className="name">OPCIJE</span>
                        </Col>

                    </Row>
                    {
                        this.state.items.map((item, idx) => {
                            return (
                                <Row className="table-row" key={idx}>
                                    <Col lg="9">
                                        <span className="value">{item.name}</span>
                                    </Col>
                                    <Col lg="3" className="actions">
                                        <Link to={`/admin/medications/${item._id}`}><Isvg src={editIcon} /></Link>

                                        <button onClick={() => this.delete(item._id)}><Isvg src={deleteIcon} /></button>
                                    </Col>
                                </Row>
                            )
                        })
                    }

                </Container>
            </div>
        );
    }
}

export default Page(ExampleListPage);