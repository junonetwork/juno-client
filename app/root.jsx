import React                  from 'react';
import { Provider }           from 'react-redux';
import store                  from './redux/store';
import App                    from './components/App';
import {
  addSheet,
}                             from './redux/modules/sheets';


store.dispatch(addSheet('1', 'ac', 20));


export default () => (
  <Provider store={store}>
    <App />
  </Provider>
);
