import React, { Component } from 'react';
import Sidebar from '../../components/sidebar';

export const DefaultLayout = (Wrapped) => (props) => {
    return (
        <div className="wrapper">
            <Sidebar {...props} />
            <div className={props.subMenu ? 'sub-menu-active' : props.sidebar ? 'sidebar-active' : ''}>
                <Wrapped {...props} />
            </div>
        </div>
    );
};

export default DefaultLayout;