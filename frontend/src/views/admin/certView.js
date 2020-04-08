import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import Isvg from 'react-inlinesvg';
import Page from '../../containers/admin/page';
import CertViewForm from '../../components/forms/certViewForm';

class CertView extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }
    componentDidMount() {
        let obj = {
            serialNumber: '1',
            countryIss: 'BA',
            countrySub: 'RS',
            organizationNameIss: 'Nova Media',
            organizationNameSub: 'FTN',
            organizationalUnitIss: 'Test',
            organizationalUnitSub: 'Test',
            commonNameIss: 'localhost',
            commonNameSub: 'localhost',
            localityNameIss: 'Bijeljina',
            localityNameSub: 'Novi Sad',
            stateNameIss: 'BiH',
            stateNameSub: 'Srbija',
            emailIss: 'test@test.com',
            emailSub: 'test@test.com',
            validFrom: '01.04.2020',
            validTo: '01.04.2030',
        }

        this.setState({
            initialValues: obj
        });


    }

    render() {
        return (
            <div>
                {
                    this.state.initialValues ?
                        <CertViewForm initialValues={this.state.initialValues} />
                        : null
                }
            </div>
        )
    }
}

export default Page(CertView)
