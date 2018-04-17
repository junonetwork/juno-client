/* import { hot }             from 'react-hot-loader';*/
import {
  prop,
}                          from 'ramda';
import {
  compose,
  setDisplayName,
  withHandlers,
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
import {
  appId,
}                          from '../../redux/modules/focus';
import mapPropsStream      from '../../falcor/mapPropsStream';
import connectFalcor       from '../../falcor/connect';
import withHotKeys         from '../../hoc/withHotKeys';


const AppContainer = compose(
  setDisplayName('AppContainer'),
  connect(
    (state) => ({
      paths: getPathSets(state),
    }),
  ),
  mapPropsStream(connectFalcor(prop('paths'))),
  connect(
    (state, { graphFragment }) => ({
      windows: getMaterializedWindows(state, graphFragment),
    }),
    (dispatch) => ({
      createWindowAction() {
        dispatch(createWindow());
      },
      deleteWindowAction() {
        dispatch(deleteWindow());
      },
      showVisualMode() {
        console.log('showVisualMode');
      },
      hideVisualMode() {
        console.log('hideVisualMode');
      },
    })
  ),
  withHotKeys(
    appId(),
    {
      'cmd+1': ({ windows, deleteWindowAction }) => () => {
        if (windows.length !== 1) {
          deleteWindowAction();
        }
      },
      'cmd+2': ({ windows, createWindowAction }) => () => {
        if (windows.length !== 2) {
          createWindowAction();
        }
      },
      ctrl: ({ showVisualMode }) => () => showVisualMode(),
    },
  ),
  withHandlers({
    onKeyUp: ({ hideVisualMode }) => ({ which }) => which === 17 && hideVisualMode(),
  })
)(App);


export default AppContainer;
/* export default hot(module)(AppContainer); */
