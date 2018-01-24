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
  createWindow,
  deleteWindow,
}                          from '../../redux/modules/windows';
import mapPropsStream      from '../../falcor/mapPropsStream';
import connectFalcor       from '../../falcor/connect';
import withHotKeys         from '../../hoc/withHotKeys';


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
    }),
    (dispatch) => ({
      createWindowAction() {
        dispatch(createWindow());
      },
      deleteWindowAction() {
        dispatch(deleteWindow());
      },
    })
  ),
  withHotKeys(
    () => false,
    ({
      'cmd+1': ({ windows, deleteWindowAction, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (windows.length !== 1) {
          deleteWindowAction();
        }
      },
      'cmd+2': ({ windows, createWindowAction, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (windows.length !== 2) {
          createWindowAction();
        }
      },
    })
  )
)(App);
