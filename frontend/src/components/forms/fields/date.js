
import React, { Component } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class Date extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <>
                {this.props.label ? <label>{this.props.label}</label> : null}
                <br />
                <DatePicker
                    onChange={this.props.onChange}
                    selected={this.props.value}
                />
            </>
        );
    }
}

export default Date;