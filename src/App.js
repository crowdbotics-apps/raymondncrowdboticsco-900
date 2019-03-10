import React, { Component } from 'react';

import Router from './router';
import { AppContext, LoadingView } from './components';
import { Auth } from './lib/firebase';

import './App.scss';

class App extends Component {
  constructor(props) {
    super(props);

    this.showLoading = () => {
      this.setState({
        loading: true
      });
    };
    this.hideLoading = () => {
      this.setState({
        loading: false
      });
    };
    this.state = {
      loading: false,
      showLoading: this.showLoading,
      hideLoading: this.hideLoading,
      user: null
    };
  }

  async componentDidMount() {
    await Auth.signInWithEmailAndPassword('admin@lensengage.com', 'P123w@rd');

    Auth.onAuthStateChanged(user => {
      this.setState({ user });
    });
  }

  render() {
    if (this.state.user) {
      return (
        <AppContext.Provider value={this.state}>
          <div className='App'>
            <Router />
          </div>
          <LoadingView />
        </AppContext.Provider>
      );
    } else {
      return <div className='App' />;
    }
  }
}

export default App;
