import React, { Component } from 'react';
import Routes from './routes'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <Routes
        {...this.state}
      />
    );
  }
}

export default App;
