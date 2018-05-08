/* import { hot }             from 'react-hot-loader';*/
import {
  isValidElement,
} from 'react';
import {
  pipe,
  prop,
  unnest,
} from 'ramda';
import {
  compose,
  setDisplayName,
  withHandlers,
} from 'recompose';
import {
  connect,
} from 'react-redux';
import mapPropsStream from '../../falcor/mapPropsStream';
import connectFalcor from '../../falcor/connect';
import {
  getWindows,
  createWindow,
  deleteWindow,
} from '../../redux/modules/windows';
import {
  appId,
} from '../../redux/modules/focus';
import withHotKeys from '../../hoc/withHotKeys';
import {
  arraySingleDepthEqualitySelector,
} from '../../utils/selectors';
import App from '../../components/App';


/**
 * @param {Object} state
 * @param {Object} windowTypes
 */
const getPathSets = arraySingleDepthEqualitySelector(
  (state, windowTypes) => (
    getWindows(state).reduce((windowPathSets, { type, id }) => {
      windowPathSets.push(windowTypes[type].getPathSets(state, id));
      return windowPathSets;
    }, [])
  ),
  unnest
);

const getWindowElements = arraySingleDepthEqualitySelector(
  pipe(
    (state, windowTypes, graphFragment) => (
      getWindows(state).reduce((windowElements, { type, id }) => {
        const windowElement = windowTypes[type].createElement(state, id, graphFragment);

        if (isValidElement(windowElement)) {
          windowElements.elements.push({ element: windowElement, id });
          return windowElements;
        }

        windowElements.partialElements.push({ component: windowElement.component, id });
        Object.assign(windowElements.hints, windowElement.hints);
        return windowElements;
      }, { elements: [], partialElements: [], hints: {} })
    ),
    ({ elements, partialElements, hints }) => elements.concat(
      partialElements.map(({ component, id }) => ({ element: component(hints), id }))
    )
  ),
  (elements) => elements
);

/*
 * <App>
 *   {{
 *     sheet: {
 *       getPathSets: (state, id) => pathSets,
 *       createElement: (state, id, graphFragment) => Element | { hints, component: (hints) => Element }
 *     }
 *   }}
 * </App>
 */
const AppContainer = compose(
  setDisplayName('AppContainer'),
  connect(
    (state, { children: windowTypes }) => ({
      paths: getPathSets(state, windowTypes),
    }),
  ),
  mapPropsStream(connectFalcor(prop('paths'))),
  connect(
    (state, { children: windowTypes, graphFragment }) => ({
      elements: getWindowElements(state, windowTypes, graphFragment),
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
      'cmd+1': ({ elements, deleteWindowAction }) => () => {
        if (elements.length !== 1) {
          deleteWindowAction();
        }
      },
      'cmd+2': ({ elements, createWindowAction }) => () => {
        if (elements.length !== 2) {
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
