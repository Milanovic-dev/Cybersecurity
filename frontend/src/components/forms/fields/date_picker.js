import React, { Component } from 'react';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import { Calendar } from 'react-date-range';

import Isvg from 'react-inlinesvg';
import moment from 'moment';

import calendarIcon from '../../../assets/svg/calendar.svg';

class DateTime extends Component {
    constructor(props) {
        super(props);

        this.state = {
            day: null,
            month: null,
            year: null,
            hour: null,
            minute: null
        };
    }


    componentDidMount() {
        if (this.props.value) {
            let day, month, year, hour, minute, dateObject;

            dateObject = moment.unix(this.props.value).toDate();
            day = ('0' + dateObject.getDate()).slice(-2);
            month = ('0' + (dateObject.getMonth() + 1)).slice(-2);
            year = dateObject.getFullYear();

            hour = ('0' + dateObject.getHours()).slice(-2);
            minute = ('0' + dateObject.getMinutes()).slice(-2);

            this.setState({
                day, month, year, hour, minute
            })
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.value != prevProps.value) {
            if (this.props.value) {
                let day, month, year, hour, minute, dateObject;


                dateObject = moment.unix(this.props.value).toDate();
                day = ('0' + dateObject.getDate()).slice(-2);
                month = ('0' + (dateObject.getMonth() + 1)).slice(-2);
                year = dateObject.getFullYear();

                hour = ('0' + dateObject.getHours()).slice(-2);
                minute = ('0' + dateObject.getMinutes()).slice(-2);

                this.setState({
                    day, month, year, hour, minute
                })
            }

        }
    }

    render() {
        return (
            <>
                {this.props.label ? <label>{this.props.label}</label> : null}
                <div className="date-time-picker-wrap">
                    <button type="button" onClick={() => this.setState({ showCalendar: !this.state.showCalendar })}><Isvg src={calendarIcon} /></button>
                    <div className="date-input">
                        <input value={this.state.day ? this.state.day : "" } onChange={(e) => this.setState({ day: e.target.value, changed: true })} type="text" placeholder="DD" className="digit2" ref={(node) => this.day = node}
                            onKeyDown={(e) => {

                                if (("0123456789".indexOf(e.key) === -1) && e.keyCode != 8 && e.keyCode != 13) {
                                    e.preventDefault();
                                    return false;
                                }


                            }}

                            onKeyUp={(e) => {
                                if (e.target.value.length >= 2) {
                                    this.day.blur();
                                    this.month.focus();
                                }

                            }}

                        />
                        <span>.</span>
                        <input value={this.state.month ? this.state.month : "" } onChange={(e) => this.setState({ month: e.target.value, changed: true })} type="text" placeholder="MM" className="digit2" ref={(node) => this.month = node}
                            onKeyDown={(e) => {
                                if (("0123456789".indexOf(e.key) === -1) && e.keyCode != 8 && e.keyCode != 13) {
                                    e.preventDefault();
                                    return false;
                                }
                            }}

                            onKeyUp={(e) => {
                                if (e.target.value.length >= 2) {
                                    this.month.blur();
                                    this.year.focus();
                                } else if (e.target.value.length == 0) {
                                    this.month.blur();
                                    this.day.focus();
                                }
                            }}
                        />
                        <span>.</span>
                        <input value={this.state.year ? this.state.year : "" } onChange={(e) => this.setState({ year: e.target.value, changed: true })} type="text" placeholder="YYYY" className="digit4" ref={(node) => this.year = node}
                            onKeyDown={(e) => {
                                if (("0123456789".indexOf(e.key) === -1) && e.keyCode != 8 && e.keyCode != 13) {
                                    e.preventDefault();
                                    return false;
                                }
                            }}

                            onKeyUp={(e) => {

                                if (e.target.value.length >= 4) {
                                    this.year.blur();
                                    this.hour.focus();
                                } else if (e.target.value.length == 0) {
                                    this.year.blur();
                                    this.month.focus();
                                }
                            }}

                        />
                    </div>
                    <div className="time-input">
                        <input value={this.state.hour ? this.state.hour : "" } onChange={(e) => this.setState({ hour: e.target.value, changed: true })} type="text" placeholder="HH" className="digit2" ref={(node) => this.hour = node}
                            onKeyDown={(e) => {
                                if (("0123456789".indexOf(e.key) === -1) && e.keyCode != 8 && e.keyCode != 13) {
                                    e.preventDefault();
                                    return false;
                                }
                            }}

                            onKeyUp={(e) => {
                                if (e.target.value.length >= 2) {
                                    this.hour.blur();
                                    this.minute.focus();
                                } else if (e.target.value.length == 0) {
                                    this.hour.blur();
                                    this.year.focus();
                                }
                            }} />
                        <span>:</span>
                        <input value={this.state.minute ? this.state.minute : "" } onChange={(e) => this.setState({ minute: e.target.value, changed: true })} type="text" placeholder="mm" className="digit2" ref={(node) => this.minute = node}
                            onKeyDown={(e) => {
                                if (("0123456789".indexOf(e.key) === -1) && e.keyCode != 8 && e.keyCode != 13) {
                                    e.preventDefault();
                                    return false;
                                }
                            }}

                            onKeyUp={(e) => {
                                if (e.target.value.length >= 2) {
                                    this.minute.blur();
                                } else if (e.target.value.length == 0) {
                                    this.minute.blur();
                                    this.hour.focus();
                                }
                            }} />
                    </div>

                    {this.state.showCalendar ? <Calendar
                        date={ this.props.value ? moment.unix(this.props.value).toDate() :  new Date()}
                        onChange={(dateObject) => {
                            let day, month, year;
                            day = ('0' + dateObject.getDate()).slice(-2);
                            month = ('0' + (dateObject.getMonth() + 1)).slice(-2);
                            year = dateObject.getFullYear();
            
                            this.setState({
                                day, month, year, changed: true, showCalendar: null
                            })
                        }}
                    />
                        :
                        null}

                    {this.state.changed ?
                        <button type="button" className="save-button" onClick={() => {
                            this.props.onChange(Math.floor(new Date(this.state.year, this.state.month - 1, this.state.day, this.state.hour, this.state.minute, 0, 0).getTime() / 1000))
                            this.setState({
                                changed: null,
                                showCalendar: null
                            })
                        }}></button>
                        :
                        null
                    }

                </div>
            </>
        );
    }
}

export default DateTime;