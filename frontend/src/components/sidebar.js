import React, { Component } from 'react';
import Isvg from 'react-inlinesvg';
import { Link } from 'react-router-dom';
import menu from '../assets/svg/menu.svg';
import list from '../assets/svg/list.svg';
import add from '../assets/svg/add.svg';
import exit from '../assets/svg/exit.svg';

class Sidebar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            _show: true
        };
    }
    render() {
        return (
            <div className={this.state._show ? `sidebar` : 'sidebar sidebar-hidden'}>
                <div className="items">
                    <h6>Admin</h6>
                    <ul>
                        <li>
                            <Link to='/tree' className={this.props[0].location.pathname === '/tree' ? 'active' : null}>
                                <Isvg src={list} />
                                All certificates
                            </Link>
                        </li>
                        <li>
                            <Link to='/addCertificate' className={this.props[0].location.pathname === '/addCertificate' ? 'active' : null}>
                                <Isvg src={add} />
                                Create new certificate
                            </Link>
                        </li>
                    </ul>
                    <ul className="logout">
                        <li id="logout" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('clinicAdminToken'); localStorage.removeItem('clinicUserToken'); localStorage.removeItem('patientToken'); }}>
                            <Link to='/login' id="logout-link" >
                                <Isvg src={exit} />
                                Log out
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="menu" onClick={() => this.setState({ _show: !this.state._show })}>
                    <Isvg src={menu} />
                </div>
            </div >
        )
    }

};

export default Sidebar;