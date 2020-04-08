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
                                    <p>Serial number: {this.props.initialValues.serialNumber}</p>
                                    <p>Valid from: {this.props.initialValues.validFrom}</p>
                                    <p>Valid to: {this.props.initialValues.validTo}</p>
                                    <p>PublicKey size: {this.props.initialValues.publicKeySize}</p>
                                    <p>Signature algorithm: {this.props.initialValues.signatureAlgorithm}</p>
                                </Col>
                                <Col lg="12">
                                    <h4 className="subtitle-cert space-top space-bottom">ISSUER</h4>
                                    <p>Country: {this.props.initialValues.issuer.country}</p>
                                    <p>Organization name: {this.props.initialValues.issuer.organizationName}</p>
                                    <p>Organizational unit: {this.props.initialValues.issuer.organizationalUnit}</p>
                                    <p>Common name: {this.props.initialValues.issuer.commonName}</p>
                                    <p>Locality name: {this.props.initialValues.issuer.localityName}</p>
                                    <p>State name: {this.props.initialValues.issuer.stateName}</p>
                                    <p>Email: {this.props.initialValues.issuer.email}</p>
                                </Col>
                                <Col lg="12">
                                    <h4 className="subtitle-cert space-top space-bottom">SUBJECT</h4>
                                    <p>Country: {this.props.initialValues.subject.country}</p>
                                    <p>Organization name: {this.props.initialValues.subject.organizationName}</p>
                                    <p>Organizational unit: {this.props.initialValues.subject.organizationalUnit}</p>
                                    <p>Common name: {this.props.initialValues.subject.commonName}</p>
                                    <p>Locality name: {this.props.initialValues.subject.localityName}</p>
                                    <p>State name: {this.props.initialValues.subject.stateName}</p>
                                    <p>Email: {this.props.initialValues.subject.email}</p>
                                </Col>
                                <Col lg="12">
                                    <h4 className="subtitle-cert space-top space-bottom">EXTENSIONS</h4>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: {this.props.initialValues.extensions["2.5.29.19"].extnID}</p>
                                    <p>Name: {this.props.initialValues.extensions["2.5.29.19"].name}</p>
                                    <p>Value: {JSON.stringify(this.props.initialValues.extensions["2.5.29.19"].value)}</p>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: {this.props.initialValues.extensions["2.5.29.15"].extnID}</p>
                                    <p>Name: {this.props.initialValues.extensions["2.5.29.15"].name}</p>
                                    <p>Value: {JSON.stringify(this.props.initialValues.extensions["2.5.29.15"].value)}</p>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: {this.props.initialValues.extensions["2.5.29.37"].extnID}</p>
                                    <p>Name: {this.props.initialValues.extensions["2.5.29.37"].name}</p>
                                    <p>Value: {JSON.stringify(this.props.initialValues.extensions["2.5.29.37"].value)}</p>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: {this.props.initialValues.extensions["1.3.6.1.5.5.7.1.1"].extnID}</p>
                                    <p>Name: {this.props.initialValues.extensions["1.3.6.1.5.5.7.1.1"].name}</p>
                                    <p>Value: {JSON.stringify(this.props.initialValues.extensions["1.3.6.1.5.5.7.1.1"].value)}</p>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: {this.props.initialValues.extensions["2.5.29.14"].extnID}</p>
                                    <p>Name: {this.props.initialValues.extensions["2.5.29.15"].name}</p>
                                    <p>Value: {JSON.stringify(this.props.initialValues.extensions["2.5.29.15"].value)}</p>
                                </Col>
                                <Col lg="12" className="space-bottom">
                                    <p>Extension ID: {this.props.initialValues.extensions["2.5.29.35"].extnID}</p>
                                    <p>Name: {this.props.initialValues.extensions["2.5.29.15"].name}</p>
                                    <p>Value: {JSON.stringify(this.props.initialValues.extensions["2.5.29.15"].value)}</p>
                                </Col>

                                {/* <Col lg="4" className="input-wrap">
                                    <Field
                                        name="serialNumber"
                                        component={renderTextField}
                                        label={"Serial number"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="4" className="input-wrap">
                                    <Field
                                        name="validFrom"
                                        component={renderTextField}
                                        label={"Valid from"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="4" className="input-wrap">
                                    <Field
                                        name="validTo"
                                        component={renderTextField}
                                        label={"Valid to"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="4" className="input-wrap">
                                    <Field
                                        name="publicKeySize"
                                        component={renderTextField}
                                        label={"PublicKey size"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="4" className="input-wrap">
                                    <Field
                                        name="signatureAlgorithm"
                                        component={renderTextField}
                                        label={"Signature algorithm"}
                                        disabled
                                    ></Field>
                                </Col> */}
                            </Row>

                            {/* <hr className="horizontal-rule" />

                            <Row>
                                <Col lg="12">
                                    <h4 className="subtitle">ISSUER</h4>
                                </Col>

                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="issuer.country"
                                        component={renderTextField}
                                        label={"Country"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="issuer.organizationName"
                                        component={renderTextField}
                                        label={"Organization name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="issuer.organizationalUnit"
                                        component={renderTextField}
                                        label={"Organizational unit"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="issuer.commonName"
                                        component={renderTextField}
                                        label={"Common name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="issuer.localityName"
                                        component={renderTextField}
                                        label={"Locality name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="issuer.stateName"
                                        component={renderTextField}
                                        label={"State name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="issuer.email"
                                        component={renderTextField}
                                        label={"Email"}
                                        disabled
                                    ></Field>
                                </Col>
                            </Row>

                            <hr className="horizontal-rule" />

                            <Row>
                                <Col lg="12">
                                    <h4 className="subtitle">SUBJECT</h4>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="subject.country"
                                        component={renderTextField}
                                        label={"Country"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="subject.organizationName"
                                        component={renderTextField}
                                        label={"Organization name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="subject.organizationalUnit"
                                        component={renderTextField}
                                        label={"Organizational unit"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="subject.commonName"
                                        component={renderTextField}
                                        label={"Common name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="subject.localityName"
                                        component={renderTextField}
                                        label={"Locality name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="subject.stateName"
                                        component={renderTextField}
                                        label={"State name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="3" className="input-wrap">
                                    <Field
                                        name="subject.email"
                                        component={renderTextField}
                                        label={"Email"}
                                        disabled
                                    ></Field>
                                </Col>

                            </Row>

                            <hr className="horizontal-rule" />

                            <Row>
                                <Col lg="12">
                                    <h4 className="subtitle">EXTENSIONS</h4>
                                </Col>
                                <Col lg="4">
                                    <div className="input-wrap">
                                        <Field
                                            name="extensions.2_5_29_19.extnID"
                                            component={renderTextField}
                                            label={"Extension ID"}
                                            disabled
                                        ></Field>
                                    </div>
                                    <div className="input-wrap">
                                        <Field
                                            name="extensions.2_5_29_19.name"
                                            component={renderTextField}
                                            label={"Name"}
                                            disabled
                                        ></Field>
                                    </div>
                                    <div className="input-wrap">
                                        <Field
                                            name="extensions.2_5_29_19.value"
                                            component={renderTextAreaField}
                                            label={"Value"}
                                            disabled
                                        ></Field>
                                    </div>
                                    
                                </Col>
                            </Row> */}


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
