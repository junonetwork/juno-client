/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  pipe,
  filter,
  reject,
  equals,
  update,
  pathOr,
  uniq,
  contains,
  map,
  not,
}                            from 'ramda';
import { connect }           from 'react-redux';
import {
  compose,
  withHandlers,
  withProps,
  mapProps,
  withStateHandlers,
}                            from 'recompose';
import { batchActions }      from 'redux-batched-actions';
import CellToolTip           from '../CellTooltipContainer';
import mapPropsStream        from '../../falcor/mapPropsStream';
import connectFalcor         from '../../falcor/connect';
import {
  getTable,
  replacePredicates,
}                            from '../../redux/modules/tables';
import {
  removeEnhancedCell,
}                            from '../../redux/modules/enhanced';
import {
  clearCellInput,
}                            from '../../redux/modules/cellInput';


const arrowKeyNavHandler = ({ selectedPredicates, addPredicates, }) => () => (
  addPredicates(selectedPredicates)
);


export default compose(
  connect(
    (state, { tableId, }) => {
      // TODO - make work for objectCollection
      const { search, predicates, } = getTable(state, tableId);

      return { search, existingPredicates: predicates, };
    },
    (dispatch, { sheetId, tableId, column, row, }) => ({
      submit: (predicates) => {
        dispatch(batchActions([
          removeEnhancedCell(sheetId, column, row),
          replacePredicates(tableId, predicates),
          clearCellInput(),
        ], 'SUBMIT_PREDICATE_INPUT'));
      },
      exit: () => {
        dispatch(batchActions([
          removeEnhancedCell(sheetId, column, row),
          clearCellInput(),
        ], 'EXIT_PREDICATE_INPUT'));
      },
    })
  ),
  withHandlers({
    addPredicates: ({ existingPredicates, type, predicateIdx, submit, }) => (newPredicates) => {
      if (newPredicates.length === 0) {
        return;
      }

      if (type === 'predicate') {
        const [firstPredicate, ...restPredicates] = newPredicates;
        // cell is predicate type - replace existing predicate w/ first new predicate
        // and append rest
        submit([
          ...update(predicateIdx, firstPredicate, existingPredicates),
          ...restPredicates,
        ]);
      } else if (newPredicates.length > 0) {
        // cell is empty type - append all new predicates
        submit([...existingPredicates, ...newPredicates]);
      }
    },
  }),
  mapPropsStream(connectFalcor(({ search, }) => ([
    // TODO - mapping search to URIs should move to falcor router
    ['collection', `schema:${search}`, 'ontology', 'list'],
  ]))),
  withStateHandlers(
    { selectionIdx: -1, selectedPredicates: [], },
    {
      setSelectionIdx: () => (selectionIdx) => ({ selectionIdx, }),
      selectPredicate: ({ selectedPredicates, }) => ({ uri, }) => ({
        selectedPredicates: [...selectedPredicates, uri],
      }),
      unselectPredicate: ({ selectedPredicates, }) => ({ uri, }) => ({
        selectedPredicates: reject(equals(uri))(selectedPredicates),
      }),
    }
  ),
  withProps(({
    graphFragment, search, existingPredicates, selectedPredicates, value,
  }) => ({
    predicateList: pipe(
      pathOr([], ['json', 'collection', `schema:${search}`, 'ontology', 'list', 'value']),
      map(({ uri, label, }) => ({ uri, label, selected: contains(uri, selectedPredicates), })),
      filter(({ uri, label, }) => (
        label &&
        uri &&
        not(contains(uri, existingPredicates)) &&
        RegExp(value, 'i').test(label)
      ))
    )(graphFragment),
  })),
  withHandlers({
    forwardSelect: ({ predicateList, selectionIdx, setSelectionIdx, }) => () => {
      if (predicateList.length === 0) {
        setSelectionIdx(-1);
      } else if (selectionIdx < predicateList.length - 1) {
        setSelectionIdx(selectionIdx + 1);
      }
    },
    backwardSelect: ({ predicateList, selectionIdx, setSelectionIdx, }) => () => {
      if (predicateList.length === 0) {
        setSelectionIdx(-1);
      } else if (selectionIdx > -1) {
        setSelectionIdx(selectionIdx - 1);
      }
    },
    arrowLeft: arrowKeyNavHandler,
    arrowRight: arrowKeyNavHandler,
    arrowAltLeft: arrowKeyNavHandler,
    arrowAltRight: arrowKeyNavHandler,
    arrowAltUp: arrowKeyNavHandler,
    arrowAltDown: arrowKeyNavHandler,
    enter: ({
      value, selectedPredicates, predicateList, selectionIdx,
      exit, addPredicates,
    }) => () => {
      if (selectionIdx === -1 && selectedPredicates.length === 0 && value === '') {
        // user hits enter w/o selecting anything or inputing anything -> exit
        exit();
      } else if (selectionIdx === -1 && selectedPredicates.length === 0) {
        // user hits enter without selecting anything -> submit manual input value
        exit();
        // TODO - handle creating new predicate
        // removeEnhancedView();
        // updateValue(sheetId, column, row, value);
      } else if (selectionIdx === -1) {
        // user selects values and hits enter while on input -> submit selection
        addPredicates(selectedPredicates);
      } else {
        // user hits enter while on predicate => submit selection w/ new predicate
        addPredicates(uniq([...selectedPredicates, predicateList[selectionIdx].uri]));
      }
    },
    shiftEnter: ({
      value, selectedPredicates, predicateList, selectionIdx,
      exit, addPredicates, selectPredicate, unselectPredicate,
    }) => () => {
      if (selectionIdx === -1 && selectedPredicates.length === 0 && value === '') {
        // user hits enter w/o selecting anything or inputing anything -> exit
        exit();
      } else if (selectionIdx === -1 && selectedPredicates.length === 0) {
        // user hits enter without selecting anything -> submit manual input value
        exit();
        // TODO - handle creating new predicate
        // removeEnhancedView();
        // updateValue(sheetId, column, row, value);
      } else if (selectionIdx === -1) {
        // user selects values and hits enter while on input -> submit selection
        addPredicates(selectedPredicates);
      } else if (predicateList[selectionIdx].selected) {
        // user unselects predicate
        unselectPredicate(predicateList[selectionIdx]);
      } else {
        // user adds predicate to selection
        selectPredicate(predicateList[selectionIdx]);
      }
    },
    esc: ({ exit, }) => () => {
      exit();
    },
    click: ({ selectedPredicates, addPredicates, }) => (uri) => {
      addPredicates(uniq([...selectedPredicates, uri]));
    },
  }),
  mapProps(({ predicateList, ...rest }) => ({
    list: predicateList,
    ...rest,
  })),
)(CellToolTip);
