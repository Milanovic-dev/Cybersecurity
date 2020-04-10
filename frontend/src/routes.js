import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';

import AdminLoginPage from './views/admin/login';
import ExampleListPage from './views/admin/exampleListPage';
import ExampleFormPage from './views/admin/exampleFormPage';
import Tree from './views/admin/tree';
import CertView from './views/admin/certView'
import AddSetificateForm from './views/admin/addSertificateForm';


class Routes extends Component {

    componentDidMount() {

    }

    render() {
        return (
            <Router >
                <div>
                    <Switch className="react-switch">
                        <Route
                            path="/"
                            exact
                            render={(...renderProps) => (
                                <AdminLoginPage {...renderProps} {...this.props} />
                            )}
                        />
                        <Route
                            path="/login"
                            exact
                            render={(...renderProps) => (
                                <AdminLoginPage {...renderProps} {...this.props} />
                            )}
                        />
                        <Route
                            path="/admin/list"
                            exact
                            render={(...renderProps) => (
                                <ExampleListPage {...renderProps} {...this.props} />
                            )}
                        />

                        <Route
                            path="/addCertificate"
                            exact
                            render={(...renderProps) => (
                                <AddSetificateForm {...renderProps} {...this.props} />
                            )}
                        />
                        <Route
                            path="/tree"
                            exact
                            render={(...renderProps) => (
                                <Tree {...renderProps} {...this.props} />
                            )}
                        />
                        <Route
                            path="/certificate/:id"
                            exact
                            render={(...renderProps) => (
                                <CertView {...renderProps} {...this.props} />
                            )}
                        />
                        
                    </Switch>
                </div>
            </Router >
        );
    }
}

export default Routes;