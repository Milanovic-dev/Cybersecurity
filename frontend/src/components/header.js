import React, { Component } from 'react';
import Isvg from 'react-inlinesvg';
import { Link } from 'react-router-dom';
import search from '../assets/svg/search.svg';
import bell from '../assets/svg/bell.svg';
import userImage from '../assets/images/user.jpg';

import {
  Container,
  Row,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown
} from 'reactstrap';


class Header extends Component {

  constructor(props) {
    super(props);
    this.handleClickOutside = this.handleClickOutside.bind(this);

    this.state = {
    };
  }


  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }


  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({
        langs: null,
        account: null
      });
    }
  }


  render() {

    return (
      <Container fluid>
        <Row>
          <Col lg="12">
            <header>

              {/*<div className="search-wrap">
                <input type="text" placeholder="Search" />
                <Isvg src={search} />
              </div>
    */}
              <div className="account-wrap">
                {/*<div className="notifications">
                  <Isvg src={bell} />
                  <div className="count">4</div>
  </div>*/}
                <UncontrolledDropdown>
                  <DropdownToggle caret>
                    {this.props.lang}
                    </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => this.props.changeLanguage('sr')}>sr</DropdownItem>
                    <DropdownItem onClick={() => this.props.changeLanguage('en')}>en</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>

              </div>

            </header>
          </Col>
        </Row>
      </Container>
    )
  }

};

export default Header;