
import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';

import Isvg from 'react-inlinesvg';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";



class Date1 extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }






    render() {
        return (
            <>
                {this.props.label ? <label>{this.props.label}</label> : null}
                <br/>
                <DatePicker
                    onChange={this.props.onChange}
                    selected={this.props.value}
                    />

            </>


        );
    }
}

export default Date1;