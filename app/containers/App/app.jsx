import {
  connect,
}                          from 'react-redux';
import {
  compose,
}                          from 'recompose';
import App                 from '../../components/App';


export default compose(
  connect()
)(App);
