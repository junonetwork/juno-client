/* global document window */
/* eslint-disable global-require */
import React                  from 'react';
import { render }             from 'react-dom';
import { AppContainer }       from 'react-hot-loader';
import Root                   from './root';
import                             './style.scss';

if (process.env.NODE_ENV === 'development') {
  window.R = require('ramda');
}


const loadApplication = (Component) => {
  render((
    <AppContainer warnings={false}>
      <Component />
    </AppContainer>
  ), document.getElementById('app'));
};


loadApplication(Root);


if (module.hot) {
  module.hot.accept('./root', () => loadApplication(Root));
}
