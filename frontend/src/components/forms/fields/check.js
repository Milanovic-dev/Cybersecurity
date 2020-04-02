import React, { Component } from 'react';

class Check extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className="checkbox-wrap" onClick={() => this.props.onChange(!this.props.value)} >
                <div className={this.props.value ? "checkbox checked" : "checkbox"}></div>
                {this.props.label ? <span className="checkbox-label">Remember me</span> : null}
            </div>

        );
    }
}

export default Check;