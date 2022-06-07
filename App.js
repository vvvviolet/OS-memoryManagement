import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FirstFitAlgorithm } from './components/FirstFitAlgorithm';
import { BestFitAlgorithm } from './components/BestFitAlgorithm';
import { DemandPaging } from './components/DemandPaging';
import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/ffa' component={FirstFitAlgorithm} />
        <Route path='/bfa' component={BestFitAlgorithm} />
        <Route path='/dp' component={DemandPaging} />
      </Layout>
    );
  }
}
