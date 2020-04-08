import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import Isvg from 'react-inlinesvg';
import Page from '../../containers/admin/page';
import CertViewForm from '../../components/forms/certViewForm';

import {
    Container,
    Row,
    Col,
} from 'reactstrap';

class CertView extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }
    componentDidMount() {
    
        let obj = {
            "issuer": {
                "country": "BA",
                "organizationName": "CybersecurityIntermediate",
                "organizationalUnit": "Test",
                "commonName": "CybersecurityIntermediate",
                "localityName": "Bijeljina",
                "stateName": "RS",
                "email": "stanojevic.milan97@gmail.com"
            },
            "subject": {
                "country": "BA",
                "organizationName": "CybersecurityEndEntity",
                "organizationalUnit": "Test",
                "commonName": "localhost",
                "localityName": "Bijeljina",
                "stateName": "RS",
                "email": "stanojevic.milan97@gmail.com"
            },
            "extensions": {
                "2.5.29.19": {
                    "extnID": "2.5.29.19",
                    "name": "Basic Constraints",
                    "value": {
                        "pathLengthConstraint": 0
                    }
                },
                "2.5.29.15": {
                    "name": "",
                    "extnID": "2.5.29.15",
                    "value": null
                },
                "2.5.29.37": {
                    "extnID": "2.5.29.37",
                    "name": "Extended Key Usage",
                    "value": [
                        "anyExtendedKeyUsage",
                        "serverAuth",
                        "clientAuth",
                        "codeSigning",
                        "emailProtection",
                        "timeStamping",
                        "OCSPSigning",
                        "MicrosoftCertificateTrustListSigning",
                        "MicrosoftEncryptedFileSystem"
                    ]
                },
                "1.3.6.1.5.5.7.1.1": {
                    "extnID": "1.3.6.1.5.5.7.1.1",
                    "name": "Authority Information Access",
                    "value": [
                        {
                            "accessMethod": "1.3.6.1.5.5.7.48.1",
                            "accessLocation": {
                                "type": 6,
                                "value": "http://localhost:4000"
                            }
                        }
                    ]
                },
                "2.5.29.14": {
                    "extnID": "2.5.29.14",
                    "name": "Subject Key Identifier",
                    "value": "03D2B864CDF4F218F5F9D3255668457BDA9F4426"
                },
                "2.5.29.35": {
                    "extnID": "2.5.29.35",
                    "name": "Authority Key Identifier",
                    "value": {
                        "keyIdentifier": "C4AD51FDEB2FE389FBD2C7851EA65796D1822301"
                    }
                }
            },
            "serialNumber": "03",
            "validFrom": "2020-01-31T23:00:00.000Z",
            "validTo": "2020-01-31T23:00:00.000Z",
            "publicKeySize": "2048",
            "signatureAlgorithm": "SHA256 with RSA (1.2.840.113549.1.1.11)"
        }

        this.setState({
            initialValues: obj
        });


    }

    render() {
        return (
            <div className="page-wrap">
                
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
