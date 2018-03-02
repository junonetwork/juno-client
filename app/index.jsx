/* global document window */
/* eslint-disable global-require */
import React                  from 'react';
import { render }             from 'react-dom';
import { Provider }           from 'react-redux';
/* import App                    from './containers/AppContainer';*/
/* import store                  from './redux/store';*/
import                             './style.scss';


if (process.env.NODE_ENV === 'development') {
  window.R = require('ramda');
}


console.log('hotreload index.jsx');
window.counter = window.counter || 0;
if (window.counter++ > 20) {
  debugger;
}


const renderApp = () => {
  const store = require('./redux/store').default;
  const App = require('./containers/AppContainer').default;

  render((
    <Provider store={store}>
      <App />
    </Provider>
  ), document.getElementById('app'));
};


if (module.hot) {
  module.hot.accept('./containers/AppContainer', () => {
    // module.hot.accept throws an error before callback runs
    // which aborts hot reload
    // but if reload succeeds, index.jsx is reloaded in a infinite loop, causing browser to freeze
    // probably b/c index.jsx imports redux files
    console.log('hot reload app');
    setTimeout(renderApp);
  });
}


renderApp();
