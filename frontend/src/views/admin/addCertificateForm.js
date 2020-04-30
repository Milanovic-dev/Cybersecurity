import React, { Component } from 'react';
import Page from '../../containers/admin/page';
import Form from '../../components/forms/addCertificate';
import { Link, Redirect } from 'react-router-dom';

import {
    Container,
    Row,
    Col,
} from 'reactstrap';



class addCertificateForm extends Component {
    constructor(props) {
        super(props);
        this.add = this.add.bind(this);
        this.get = this.get.bind(this);
        this.state = {
            ext: []
        };
    }

    add(data) {
        data.serialNumber = 1;
        console.log(data);
        let url = this.props[0].match.params.parentId ? 'https://localhost:4000/certificate/create/' + this.props[0].match.params.parentId : 'https://localhost:4000/certificate/createRoot';
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        }).then((res) => res.json()).then((result) => {
            console.log(result);
            this.props[0].history.push('/tree');
        }).catch((err) => {
            console.log(err);
        });
    }
    componentDidMount() {
        this.get();

    }
    get() {
        let obj = [];
        if (!this.props[0].match.params.parentId) {

            obj = [
                { name: "anyExtendedKeyUsage", text: "Any extended key usage" },
                { name: "serverAuth", text: "Server authentifcation" },
                { name: "clientAuth", text: "Client autentification" },
                { name: "codeSigning", text: "Code signin" },
                { name: "emailProtection", text: "Email protection" },
                { name: "timeStamping", text: "Time Stamping" },
                { name: "OCSPSigning", text: "OCSP signin" },
                { name: "MicrosoftCertificateTrustListSigning", text: "Microsoft certificate trust list signing" },
                { name: "MicrosoftEncryptedFileSystem", text: "Microsoft encrypted filesystem" }
            ];
            this.setState({
                extensions: obj
            })

        } else if (this.props[0].match.params.parentId) {
            fetch('https://localhost:4000/certificate/getOne/' + this.props[0].match.params.parentId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            }).then((res) => res.json()).then((result) => {
                console.log(result.parsedCertificate.extensions["2.5.29.37"].value);

                let array = result.parsedCertificate.extensions["2.5.29.37"].value;
                for (let i = 0; i < array.length; i++) {
                    if (array[0] == "anyExtendedKeyUsage") {
                        obj.push({ name: "anyExtendedKeyUsage", text: "Any extended key usage" });
                    } else if (array[i] == "serverAuth") {
                        obj.push({ name: "serverAuth", text: "Server authentifcation" });
                    }
                    else if (array[i] == "clientAuth") {
                        obj.push({ name: "clientAuth", text: "Client autentification" });
                    }
                    else if (array[i] == "codeSigning") {
                        obj.push({ name: "codeSigning", text: "Code signin" });
                    }
                    else if (array[i] == "emailProtection") {
                        obj.push({ name: "emailProtection", text: "Email protection" });
                    }
                    else if (array[i] == "timeStamping") {
                        obj.push({ name: "timeStamping", text: "Time Stamping" });
                    }
                    else if (array[i] == "OCSPSigning") {
                        obj.push({ name: "OCSPSigning", text: "OCSP signin" });
                    }
                    else if (array[i] == "serverAuth") {
                        obj.push({ name: "serverAuth", text: "Server authentifcation" });
                    }
                    else if (array[i] == "MicrosoftCertificateTrustListSigning") {
                        obj.push({ name: "MicrosoftCertificateTrustListSigning", text: "Microsoft certificate trust list signing" });
                    }
                    else if (array[i] == "MicrosoftEncryptedFileSystem") {
                        obj.push({ name: "MicrosoftEncryptedFileSystem", text: "Microsoft encrypted filesystem" });
                    }
                }
                console.log("rezzzz: ");
                console.log(obj);
                this.setState({
                    extensions: obj
                })

            });


        }
    }

    render() {
        return (
            <div className="page-wrap">
                {
                    !localStorage.token ? <Redirect to='/login' /> : null
                }
                <Container fluid>
                    <Row className="page-title">
                        <Col lg="12">
                        </Col>
                    </Row>
                    <Form isRoot={!this.props[0].match.params.parentId} extensions={this.state.extensions} onSubmit={this.add} />
                </Container>
            </div>
        );
    }
}

export default Page(addCertificateForm);