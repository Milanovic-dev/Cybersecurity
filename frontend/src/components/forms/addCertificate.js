import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderTextField, renderMultiSelectField, renderCheckField, renderDateTimeField, render2letterOption } from './fields/renderFields';
import {
    Container,
    Row,
    Col,
} from 'reactstrap';


const required = value => value ? undefined : "Required"

class form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    handleChange(event) {
    }

    render() {
        return (
            <form onSubmit={this.props.handleSubmit}>
                <Row>
                    <Col lg="12" >
                        <Container fluid className="form-box">
                            <Row>
                                <Col lg="12">
                                    <h3 className="title">New certificate</h3>
                                    <h6 className="subtitle">Enter required informations for the new certificate</h6>
                                </Col>
                            </Row>
                            {

                            this.props.isRoot ? 
                            <>

                            <Row>
                               
                                    <Col lg="6" className="input-wrap">
                                        <h3 className="title">Issuer</h3>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg="6" className="input-wrap">
                                        <Field
                                            name="issuer.country"
                                            component={render2letterOption}
                                            label={"Country in 2 letters"}
                                            placeholder="Choose country"
                                            validate={[required]}
                                            onChange={this.handleChange}
                                        ></Field>
                                    </Col>
                                    <Col lg="6" className="input-wrap">
                                        <Field
                                            name="issuer.organizationName"
                                            component={renderTextField}
                                            label={"Organization"}
                                            placeholder="Please enter the name of organization"
                                            validate={[required]}
                                            onChange={this.handleChange}
                                        ></Field>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg="6" className="input-wrap">
                                        <Field
                                            name="issuer.organizationalUnit"
                                            component={renderTextField}
                                            label={"Organization unit"}
                                            placeholder="Please enter the organization unit"
                                            validate={[required]}
                                            onChange={this.handleChange}
                                        ></Field>
                                    </Col>
                                    <Col lg="6" className="input-wrap">
                                        <Field
                                            name="issuer.commonName"
                                            component={renderTextField}
                                            label={"Common name"}
                                            placeholder="Enter the common name"
                                            validate={[required]}
                                            onChange={this.handleChange}
                                        ></Field>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg="6" className="input-wrap">
                                        <Field
                                            name="issuer.localityName"
                                            component={renderTextField}
                                            label={"Locality name"}
                                            placeholder="Please enter the locality name"
                                            validate={[required]}
                                            onChange={this.handleChange}
                                        ></Field>
                                    </Col>
                                    <Col lg="6" className="input-wrap">
                                        <Field
                                            name="issuer.stateName"
                                            component={renderTextField}
                                            label={"State name"}
                                            placeholder="Please enter the locality name"
                                            validate={[required]}
                                            onChange={this.handleChange}
                                        ></Field>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg="6" className="input-wrap">
                                        <Field
                                            name="issuer.email"
                                            component={renderTextField}
                                            label={"Email"}
                                            placeholder="Please enter an email"
                                            validate={[required]}
                                            onChange={this.handleChange}
                                        ></Field>
                                    </Col>
                                </Row>
                                </> : null
                                }
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <h3 className="title">Subject</h3>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="subject.country"
                                        component={render2letterOption}
                                        label={"Country in 2 letters"}
                                        placeholder="Choose the country"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="subject.organizationName"
                                        component={renderTextField}
                                        label={"Organization name"}
                                        placeholder="Enter the organization name"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="subject.organizationalUnit"
                                        component={renderTextField}
                                        label={"Organizatio unit"}
                                        placeholder="Please enter the organization unit"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="subject.commonName"
                                        component={renderTextField}
                                        label={"Common name"}
                                        placeholder="Please enter the common name"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="subject.localityName"
                                        component={renderTextField}
                                        label={"Locality name"}
                                        placeholder="Please enter the locality name"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="subject.stateName"
                                        component={renderTextField}
                                        label={"State name"}
                                        placeholder="Please enter the state name"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="subject.email"
                                        component={renderTextField}
                                        label={"Email"}
                                        placeholder="Please enter an email"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <h3 className="title">Certificate details</h3>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="validFrom"
                                        component={renderDateTimeField}
                                        label={"Valid from:"}
                                        placeholder="Choose a date"
                                        validate={[required]}
                                    ></Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="validTo"
                                        component={renderDateTimeField}
                                        label={"Valid to:"}
                                        placeholder="Choose a date"
                                        validate={[required]}
                                    ></Field>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="extendedKeyUsage"
                                        component={renderMultiSelectField}
                                        label={"Extended key usage"}
                                        placeholder="Choose extended key usage"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                        id="extendedKeyUsage"
                                    >
                                        {this.props.extensions && this.props.extensions.map((item, idx) => {
                                            return (
                                                <option value={item.name}>{item.text}</option>
                                            )
                                        })}
                                    </Field>
                                </Col>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="basicConstraints.pathLengthConstraint"
                                        component={renderTextField}
                                        label={"Path lenght constraint"}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg="6" className="input-wrap">
                                    <Field
                                        name="basicConstraints.isCA"
                                        component={renderCheckField}
                                        label={"is CA?"}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                    <Col lg="12">
                        <button className="button">Save</button>
                    </Col>
                </Row>
            </form>
        )
    }
}


export default reduxForm({
    form: 'form'
})(form)
