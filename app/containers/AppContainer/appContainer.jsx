import {
  prop,
}                          from 'ramda';
import {
  compose,
  setDisplayName,
}                          from 'recompose';
import {
  connect,
}                          from 'react-redux';
import App                 from '../../components/App';
import {
  getPathSets,
  getMaterializedWindows,
}                          from '../../redux/modules/windows';
import mapPropsStream      from '../../falcor/mapPropsStream';
import connectFalcor       from '../../falcor/connect';


export default compose(
  setDisplayName('AppContainer'),
  connect(
    (state) => ({
      paths: getPathSets(state),
    }),
  ),
  mapPropsStream(connectFalcor(prop('paths'))),
  connect(
    (state, { graphFragment, }) => ({
      windows: getMaterializedWindows(state, graphFragment),
    })
  )
)(App);
