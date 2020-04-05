import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
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
              <div className="account-wrap">
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