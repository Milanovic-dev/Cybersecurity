import React from 'react';
import { Field, reduxForm } from 'redux-form'
import Text from './fields/text';
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
                                    <h3 className="title">Pregled sertifikata</h3>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="serialNumber"
                                        component={renderTextField}
                                        label={"Serial number"}
                                        disabled
                                    ></Field>
                                </Col>
                            </Row>
                            <hr className="horizontal-rule"/>
                            <Row>
                                <Col lg="6">
                                    <h4 className="subtitle">ISSUER</h4>
                                </Col>
                                <Col lg="6">
                                    <h4 className="subtitle">SUBJECT</h4>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="countryIss"
                                        component={renderTextField}
                                        label={"Country"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="countrySub"
                                        component={renderTextField}
                                        label={"Country"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="organizationNameIss"
                                        component={renderTextField}
                                        label={"Organization name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="organizationNameSub"
                                        component={renderTextField}
                                        label={"Organization name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="organizationalUnitIss"
                                        component={renderTextField}
                                        label={"Organizational unit"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="organizationalUnitSub"
                                        component={renderTextField}
                                        label={"Organizational unit"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="commonNameIss"
                                        component={renderTextField}
                                        label={"Common name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="commonNameSub"
                                        component={renderTextField}
                                        label={"Common name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="localityNameIss"
                                        component={renderTextField}
                                        label={"Locality name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="localityNameSub"
                                        component={renderTextField}
                                        label={"Locality name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="stateNameIss"
                                        component={renderTextField}
                                        label={"State name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="stateNameSub"
                                        component={renderTextField}
                                        label={"State name"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="emailIss"
                                        component={renderTextField}
                                        label={"Email"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="emailSub"
                                        component={renderTextField}
                                        label={"Email"}
                                        disabled
                                    ></Field>
                                </Col>
                            </Row>
                            <hr className="horizontal-rule"/>
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="validFrom"
                                        component={renderTextField}
                                        label={"Valid from"}
                                        disabled
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="validTo"
                                        component={renderTextField}
                                        label={"Valid to"}
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
