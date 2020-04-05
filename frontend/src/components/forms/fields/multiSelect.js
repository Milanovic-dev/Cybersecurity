import React, { Component } from 'react';


import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,

} from 'reactstrap';


function objectIndexOf(arr, _id) {
    var found = false;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i]._id == _id) {
            found = true;
            return i;
        }
    }
    return -1;

}

class MultiSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {

        return (
            <div className="input-wrap">
                <label>{this.props.label}</label>

                <Dropdown className={this.props.error ? 'select-field required' : 'select-field'} isOpen={this.state.dropdownOpen} toggle={() => { this.setState({ dropdownOpen: !this.state.dropdownOpen }) }}>
                    <DropdownToggle nav caret>
                        {
                            this.props.children && this.props.value && this.props.value.length ? this.props.children.find(o => o.props.value === this.props.value[0]) ? this.props.children.find(o => o.props.value === this.props.value[0]).props.children : this.props.placeholder : this.props.placeholder
                        }
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-animation">
                        {
                            this.props.children && this.props.children.map((children) => {
                                if (children.props)
                                    return (
                                        <DropdownItem className={typeof(children.props.value) != 'object' ?  (this.props.value.indexOf(children.props.value) !== -1 ? 'selected' : null) : (objectIndexOf(this.props.value, children.props.value._id) !== -1 ? 'selected' : null) } onClick={() => {
                                            let values = this.props.value;
                                            if (!values) {
                                                values = [];
                                            }

                                            let index = typeof(children.props.value) != 'object' ? values.indexOf(children.props.value) : objectIndexOf(values, children.props.value._id);

                                            if (index !== -1) {
                                                values.splice(index, 1);
                                            } else {
                                                values.push(children.props.value);
                                            }
                                            this.props.onChange(values);
                                        }}>{children.props.children}</DropdownItem>
                                    )
                            })
                        }
                    </DropdownMenu>
                </Dropdown>
            </div>
        );
    }
}

export default MultiSelect;