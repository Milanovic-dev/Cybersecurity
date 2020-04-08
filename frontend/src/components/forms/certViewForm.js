import React from 'react';
import { Field, reduxForm } from 'redux-form'
import Text from './fields/text_field';
import TextArea from './fields/textarea';
import Image from './fields/image';

import {
    Container,
    Row,
    Col,
} from 'reactstrap';

const required = value => value ? undefined : "Required"

const renderTextField = ({
    input,
    placeholder,
    label,
    meta: { touched, error },
    disabled
}) => (
        <Text
            placeholder={placeholder}
            label={label}
            errorText={touched && error}
            error={touched && error}
            {...input}
            disabled={disabled}
        />
    )
const renderTextAreaField = ({
    input,
    placeholder,
    label,
    meta: { touched, error },
    disabled
}) => (
        <TextArea
            placeholder={placeholder}
            label={label}
            errorText={touched && error}
            error={touched && error}
            {...input}
            disabled={disabled}
        />
    )


const renderImageField = ({
    input,
    placeholder,
    meta: { touched, error },
}) => (

        <Image
            placeholder={placeholder}
            errorText={touched && error}
            error={touched && error}

            {...input}
        />
    )

class form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        const { handleSubmit } = this.props;
        console.log(this.props);
        return (
            <form onSubmit={handleSubmit}>
                <Row>
                    <Col lg="12" >
                        <Container fluid className="form-box">
                            <Row>
                                <Col lg="12">
                                    <h3 className="title space-bottom">Pregled sertifikata</h3>
                                </Col>
                                <Col lg="12">
                                    <p>Serial number: <span className="black">{this.props.initialValues.parsedCertificate.serialNumber}</span></p>
                                    <p>Valid from: <span className="black">{this.props.initialValues.parsedCertificate.validFrom}</span></p>
                                    <p>Valid to: <span className="black">{this.props.initialValues.parsedCertificate.validTo}</span></p>
                                    <p>PublicKey size: <span className="black">{this.props.initialValues.parsedCertificate.publicKeySize}</span></p>
                                    <p>Signature algorithm: <span className="black">{this.props.initialValues.parsedCertificate.signatureAlgorithm}</span></p>
                                </Col>
                                <Col lg="12">
                                    <h4 className="subtitle-cert space-top space-bottom">ISSUER</h4>
                                    <p>Country: <span className="black">{this.props.initialValues.parsedCertificate.issuer.country}</span></p>
                                    <p>Organization name: <span className="black">{this.props.initialValues.parsedCertificate.issuer.organizationName}</span></p>
                                    <p>Organizational unit: <span className="black">{this.props.initialValues.parsedCertificate.issuer.organizationalUnit}</span></p>
                                    <p>Common name: <span className="black">{this.props.initialValues.parsedCertificate.issuer.commonName}</span></p>
                                    <p>Locality name: <span className="black">{this.props.initialValues.parsedCertificate.issuer.localityName}</span></p>
                                    <p>State name: <span className="black">{this.props.initialValues.parsedCertificate.issuer.stateName}</span></p>
                                    <p>Email: <span className="black">{this.props.initialValues.parsedCertificate.issuer.email}</span></p>
                                </Col>
                                <Col lg="12">
                                    <h4 className="subtitle-cert space-top space-bottom">SUBJECT</h4>
                                    <p>Country: <span className="black">{this.props.initialValues.parsedCertificate.subject.country}</span></p>
                                    <p>Organization name: <span className="black">{this.props.initialValues.parsedCertificate.subject.organizationName}</span></p>
                                    <p>Organizational unit: <span className="black">{this.props.initialValues.parsedCertificate.subject.organizationalUnit}</span></p>
                                    <p>Common name: <span className="black">{this.props.initialValues.parsedCertificate.subject.commonName}</span></p>
                                    <p>Locality name: <span className="black">{this.props.initialValues.parsedCertificate.subject.localityName}</span></p>
                                    <p>State name: <span className="black">{this.props.initialValues.parsedCertificate.subject.stateName}</span></p>
                                    <p>Email: <span className="black">{this.props.initialValues.parsedCertificate.subject.email}</span></p>
                                </Col>
                                <Col lg="12">
                                    <h4 className="subtitle-cert space-top space-bottom">EXTENSIONS</h4>
                                </Col>
                                {/* <Col lg="12" className="space-bottom">
                                    <p>Extension ID: <span className="black">{this.props.initialValues.parsedCertificate.extensions["2.5.29.19"].extnID}</span></p>
                                    <p>Name: <span className="black">{this.props.initialValues.parsedCertificate.extensions["2.5.29.19"].name}</span></p>
                                    <p>Value: <span className="black">{JSON.stringify(this.props.initialValues.parsedCertificate.extensions["2.5.29.19"].value)}</span></p>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: <span className="black">{this.props.initialValues.parsedCertificate.extensions["2.5.29.15"].extnID}</span></p>
                                    <p>Name: <span className="black">{this.props.initialValues.parsedCertificate.extensions["2.5.29.15"].name}</span></p>
                                    <p>Value: <span className="black">{JSON.stringify(this.props.initialValues.parsedCertificate.extensions["2.5.29.15"].value)}</span></p>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: <span className="black">{this.props.initialValues.parsedCertificate.extensions["2.5.29.37"].extnID}</span></p>
                                    <p>Name: <span className="black">{this.props.initialValues.parsedCertificate.extensions["2.5.29.37"].name}</span></p>
                                    <p>Value: <span className="black">{JSON.stringify(this.props.initialValues.parsedCertificate.extensions["2.5.29.37"].value)}</span></p>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: <span className="black">{this.props.initialValues.parsedCertificate.extensions["1.3.6.1.5.5.7.1.1"].extnID}</span></p>
                                    <p>Name: <span className="black">{this.props.initialValues.parsedCertificate.extensions["1.3.6.1.5.5.7.1.1"].name}</span></p>
                                    <p>Value: <span className="black">{JSON.stringify(this.props.initialValues.parsedCertificate.extensions["1.3.6.1.5.5.7.1.1"].value)}</span></p>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: <span className="black">{this.props.initialValues.parsedCertificate.extensions["2.5.29.14"].extnID}</span></p>
                                    <p>Name: <span className="black">{this.props.initialValues.parsedCertificate.extensions["2.5.29.15"].name}</span></p>
                                    <p>Value: <span className="black">{JSON.stringify(this.props.initialValues.parsedCertificate.extensions["2.5.29.15"].value)}</span></p>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: <span className="black">{this.props.initialValues.parsedCertificate.extensions["2.5.29.35"].extnID}</span></p>
                                    <p>Name: <span className="black">{this.props.initialValues.parsedCertificate.extensions["2.5.29.15"].name}</span></p>
                                    <p>Value: <span className="black">{JSON.stringify(this.props.initialValues.parsedCertificate.extensions["2.5.29.15"].value)}</span></p>
                                </Col> */}
                            </Row>
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="certificate"
                                        component={renderTextAreaField}
                                        label={"Certificate"}
                                        disabled
                                    ></Field>

                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="privateKey"
                                        component={renderTextAreaField}
                                        label={"Private Key"}
                                        disabled
                                    ></Field>

                                </Col>
                            </Row>



                        </Container>
                    </Col>


                </Row>

            </form>
        )
    }
}

export default reduxForm({
    form: 'form'  // a unique identifier for this form
})(form)
