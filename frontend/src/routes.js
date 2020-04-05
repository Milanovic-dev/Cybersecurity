import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch
} from 'react-router-dom';

import AdminLoginPage from './views/admin/login';
import ExampleListPage from './views/admin/exampleListPage';
import ExampleFormPage from './views/admin/exampleFormPage';

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
                            path="/admin/list/:id"
                            exact
                            render={(...renderProps) => (
                                <ExampleFormPage {...renderProps} {...this.props} />
                            )}
                        />


                    </Switch>
                </div>
            </Router >
        );
    }
}

export default Routes;