import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderTextField, renderSelectField, renderCheckField, renderDateTimeField, render2letterOption} from './fields/renderFields';
import DatePicker from '../forms/fields/date_picker';
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

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event){
        event.preventDefault();

        console.log(this.props.match.params.parentId);
    }

    handleChange(event){
        console.log(event);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <Row>
                    <Col lg="12" >
                        <Container fluid className="form-box">
                            <Row>
                                <Col lg="12">
                                    <h3 className="title">Novi sertifikat</h3>
                                    <h6 className="subtitle">Unesite potrebne informacije za unos novog sertifikata</h6>

                                </Col>
                                </Row>
                                <Row>
                                <Col lg="6"  className="input-wrap">
                                    <h3 className="title">Izdavalac</h3>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="country"
                                        component={render2letterOption}
                                        label={"Država u dva slova"}
                                        placeholder="Izaberite državu"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="organizationName"
                                        component={renderTextField}
                                        label={"Organizacija"}
                                        placeholder="Unesite ime organizacije"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="organisationUnit"
                                        component={renderTextField}
                                        label={"Organizaciona jedinica"}
                                        placeholder="Unesite organizacionu jedinicu"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="commonName"
                                        component={renderTextField}
                                        label={"Uobičajeno ime"}
                                        placeholder="Unesite uobičajeno ime"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="localityName"
                                        component={renderTextField}
                                        label={"Grad"}
                                        placeholder="Unesite grad"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="stateName"
                                        component={renderTextField}
                                        label={"Država"}
                                        placeholder="Unesite državu"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                </Row>
                                <Row>
                                    <Col lg="6"  className="input-wrap">
                                        <Field
                                            name="email"
                                            component={renderTextField}
                                            label={"Email"}
                                            placeholder="Unesite email"
                                            validate={[required]}
                                            onChange={this.handleChange}
                                        ></Field>
                                    </Col>
                                </Row>
        
                                <Row>
                                    <Col lg="6"  className="input-wrap">
                                        <h3 className="title">Primalac</h3>
                                    </Col>
                                </Row>
                                <Row>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="country"
                                        component={render2letterOption}
                                        label={"Država u dva slova"}
                                        placeholder="Izaberite državu"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="organizationName"
                                        component={renderTextField}
                                        label={"Organizacija"}
                                        placeholder="Unesite ime organizacije"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="organisationUnit"
                                        component={renderTextField}
                                        label={"Organizaciona jedinica"}
                                        placeholder="Unesite organizacionu jedinicu"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="commonName"
                                        component={renderTextField}
                                        label={"Uobičajeno ime"}
                                        placeholder="Unesite uobičajeno ime"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="localityName"
                                        component={renderTextField}
                                        label={"Grad"}
                                        placeholder="Unesite grad"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="stateName"
                                        component={renderTextField}
                                        label={"Država"}
                                        placeholder="Unesite državu"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                </Row>
                                <Row>
                                    <Col lg="6"  className="input-wrap">
                                        <Field
                                            name="email"
                                            component={renderTextField}
                                            label={"Email"}
                                            placeholder="Unesite email"
                                            validate={[required]}
                                            onChange={this.handleChange}
                                        ></Field>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg="6"  className="input-wrap">
                                            <h3 className="title">Detalji sertifikata</h3>
                                    </Col>
                                </Row>
                                <Row>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="validFrom"
                                        component={renderDateTimeField}
                                        label={"Važi od:"}
                                        placeholder="Unesite datum početka važenja"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="validTo"
                                        component={DatePicker}
                                        label={"Važi do:"}
                                        placeholder="Unesite datum kraja važenja"
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="extendedKeyUsage"
                                        component={renderSelectField}
                                        label={"Ovlašćenja"}
                                        placeholder="Unesite ovlašćenja"
                                        validate={[required]}
                                        id="extendedKeyUsage"
                                        onChange={this.handleChange}
                                    > 
                                        <option value="anyExtendedKeyUsage">Proširena ovlašćenja</option>
                                        <option value="serverAuth">Serverska autentifikacija</option>
                                        <option value="clientAuth">Klijentska autentifikacija</option>
                                        <option value="codeSigning">Potpisivanje koda</option>
                                        <option value="emailProtection">Zaštita email pošte</option>
                                        <option value="timeStamping">Time Stamping</option>
                                        <option value="OCSPSigning">OCSP potpisivanje</option>
                                        <option value="MicrosoftCertificateTrustListSigning">Potpisivanje liste poverenja sa Microsoft certifikatom</option>
                                        <option value="MicrosoftEncryptedFileSystem">Microsoft šifrovani sistem datoteka</option>                             
                                        </Field>
                                </Col>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="pathLengthConstraint"
                                        component={renderTextField}
                                        label={"Moguć broj izdavanja CA sertifikata"}
                                        validate={[required]}
                                        onChange={this.handleChange}
                                    ></Field>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="6"  className="input-wrap">
                                    <Field
                                        name="isCA"
                                        component={renderCheckField}
                                        label={"Da li je CA?"}
                                        validate={[required]}
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
    form: 'form'  // a unique identifier for this form
})(form)
