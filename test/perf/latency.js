/* eslint-disable global-require */
import {
  createStore,
  applyMiddleware,
}                             from 'redux';
import thunk                  from 'redux-thunk';
import {
  enableBatching,
}                             from 'redux-batched-actions';
import reducer                from '../../app/redux/reducer';
import {
  addSheet,
}                             from '../../app/redux/modules/sheets';
import {
  addSearchCollectionTable,
}                             from '../../app/redux/modules/tables';
import {
  formatSheetAddress,
  formatAddress,
}                             from '../../app/utils/cell';
import {
  runPerfTests,
}                             from './utils';
import {
  graphFragment,
}                             from './perf-data';


const initStore = () => {
  const store =  createStore(
    enableBatching(reducer),
    applyMiddleware(
      thunk
      // createEpicMiddleware(epic)
    )
  );

  store.dispatch(addSheet(0, 100, 400));
  store.dispatch(addSearchCollectionTable(
    '0',
    formatSheetAddress('0', 0, 0),
    formatAddress(0, 0),
    'Person',
    ['schema:name', 'schema:birthPlace', 'schema:birthDate', 'schema:sibling'],
    [0, 1, 2, 3]
  ));

  return store;
};


runPerfTests([
  {
    title: 'Initial       ',
    count: 50,
    pre: () => {
      const store = initStore();
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      return { state: store.getState(), getSheetMatrix, };
    },
    perf: ({ state, getSheetMatrix, }) => {
      // console.log(JSON.stringify(getSheetMatrix(state, '0', graphFragment.json), null, 2));
      getSheetMatrix(state, '0', graphFragment.json);
    },
    post: () => {
      delete require.cache[require.resolve('../../app/redux/modules/sheets')];
    },
  },
  {
    title: 'Fully Memoized',
    count: 50,
    pre: () => {
      const store = initStore();
      const { getSheetMatrix, } = require('../../app/redux/modules/sheets');

      getSheetMatrix(store.getState(), '0', graphFragment.json);

      return { state: store.getState(), getSheetMatrix, };
    },
    perf: ({ state, getSheetMatrix, }) => {
      getSheetMatrix(state, '0', graphFragment.json);
    },
  },
]);
