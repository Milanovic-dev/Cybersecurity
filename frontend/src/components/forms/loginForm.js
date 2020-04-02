import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form'
import Isvg from 'react-inlinesvg';
import { Link } from 'react-router-dom';

import Text from './fields/text';
import Check from './fields/check';
import Select from './fields/select';

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
    type,
    id
}) => (

        <Text
            placeholder={placeholder}
            label={label}
            errorText={touched && error}
            id={id}
            type={type}
            error={touched && error}
            {...input}
        />
    )


const renderCheckField = ({
    input,
    label,
    meta: { touched, error },
}) => (

        <Check
            label={label}
            errorText={touched && error}
            error={touched && error}
            {...input}
        />
    )

const renderSelectField = ({
    input,
    placeholder,
    label,
    meta: { touched, error },
    children,
    id
}) => (

        <Select
            placeholder={placeholder}
            label={label}
            id={id}
            errorText={touched && error}
            error={touched && error}
            {...input}
        >
            {children}
        </Select>
    )


const form = (props) => {
    const { handleSubmit, pristine, reset, submitting } = props;
    console.log(pristine, submitting);

    return (

        <form onSubmit={handleSubmit}>
            <Row>
                <Col lg="12" className="input-wrap">
                    <Field
                        name="type"
                        component={renderSelectField}
                        label={"Tip korisnika"}
                        placeholder="Izaberite tip"
                        validate={[required]}
                        id="type"
                    >
                        <option value="admin">Admin kliničkog centra</option>
                        <option value="clinicAdmin">Admin klinike</option>
                        <option value="clinicUser">Medicinsko osoblje</option>
                        <option value="patient">Pacijent</option>

                    </Field>

                </Col>

                <Col lg="12" className="input-wrap">
                    <Field
                        name="username"
                        id="username"
                        component={renderTextField}
                        placeholder="Korisničko ime"
                    ></Field>
                </Col>
                <Col lg="12" className="input-wrap">
                    <Field
                        name="password"
                        id="password"
                        component={renderTextField}
                        placeholder="Lozinka"
                        type="password"
                    ></Field>
                </Col>
                {/*<Col lg="6" xs="12" className="input-wrap">

                    <Field
                        name="remeber"
                        label="Remember me"
                        component={renderCheckField}

                    ></Field>

                </Col>
                <Col lg="6" xs="12" className="input-wrap forgot-password-wrap">
                    <Link to='/' className="forgot-password">Forgot Password?</Link>
                </Col>
                */
                }

                <Col lg="12">
                    <button id="login-button">PRIJAVI SE</button>
                </Col>
            </Row>
        </form>
    )
}

export default reduxForm({
    form: 'form'  // a unique identifier for this form
})(form)
