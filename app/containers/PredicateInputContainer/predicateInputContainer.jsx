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
  cellId,
  predicateInputId,
  setFocus,
}                            from '../../redux/modules/focus';
import {
  navigate,
}                            from '../../redux/modules/navigate';
import {
  FAST_STEP,
}                            from '../../preferences';


const arrowKeyNavHandler = (direction, steps) => ({
  selectedPredicates, addPredicates, navigate,
}) => (e) => {
  e.preventDefault();
  e.stopPropagation();

  navigate(direction, steps);
  addPredicates(selectedPredicates);
};


export default compose(
  connect(
    (state, { tableId }) => {
      // TODO - make work for valueCollection
      const {
        repository,
        type: resourceType,
        predicates: existingPredicates,
      } = getTable(state, tableId);

      return { existingPredicates, repository, resourceType };
    },
    (dispatch, { sheetId, tableId, column, row }) => ({
      submit: (predicates) => {
        dispatch(batchActions([
          replacePredicates(tableId, predicates),
          setFocus(cellId(sheetId, column, row)),
        ], 'SUBMIT_PREDICATE_INPUT'));
      },
      exit: () => {
        dispatch(setFocus(cellId(sheetId, column, row)));
      },
      navigate: (direction, steps) => {
        dispatch(navigate(sheetId, column, row, direction, steps));
      },
    })
  ),
  withHandlers({
    addPredicates: ({
      existingPredicates, cellType, predicateIdx, submit, blur,
    }) => (newPredicates) => {
      if (newPredicates.length === 0) {
        blur();
      } else if (cellType === 'predicate') {
        const [firstPredicate, ...restPredicates] = newPredicates;
        // cell is predicate type - replace existing predicate w/ first new predicate
        // and append rest
        submit([
          ...update(predicateIdx, firstPredicate, existingPredicates),
          ...restPredicates,
        ]);
      } else {
        // cell is empty type - append all new predicates
        submit([...existingPredicates, ...newPredicates]);
      }
    },
  }),
  mapPropsStream(connectFalcor(({ repository, resourceType }) => ([
    ['ontology', repository, 'type', resourceType],
  ]))),
  withStateHandlers(
    { selectionIdx: -1, selectedPredicates: [] },
    {
      setSelectionIdx: () => (selectionIdx) => ({ selectionIdx }),
      selectPredicate: ({ selectedPredicates }) => ({ uri }) => ({
        selectedPredicates: [...selectedPredicates, uri],
      }),
      unselectPredicate: ({ selectedPredicates }) => ({ uri }) => ({
        selectedPredicates: reject(equals(uri))(selectedPredicates),
      }),
    }
  ),
  withProps(({
    graphFragment, repository, resourceType, existingPredicates, selectedPredicates, value,
  }) => ({
    predicateList: pipe(
      pathOr([], ['json', 'ontology', repository, 'type', resourceType, 'value']),
      map(({ uri, label }) => ({ uri, label, selected: contains(uri, selectedPredicates) })),
      filter(({ uri, label }) => (
        label &&
        uri &&
        not(contains(uri, existingPredicates)) &&
        RegExp(value, 'i').test(label)
      ))
    )(graphFragment),
  })),
  withHandlers({
    forwardSelect: ({ predicateList, selectionIdx, setSelectionIdx }) => () => {
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
    arrowLeft: arrowKeyNavHandler('left', 1),
    arrowRight: arrowKeyNavHandler('right', 1),
    arrowAltLeft: arrowKeyNavHandler('left', FAST_STEP),
    arrowAltRight: arrowKeyNavHandler('right', FAST_STEP),
    arrowAltUp: arrowKeyNavHandler('up', FAST_STEP),
    arrowAltDown: arrowKeyNavHandler('down', FAST_STEP),
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
    esc: ({ exit }) => () => {
      exit();
    },
    click: ({ selectedPredicates, addPredicates }) => (uri) => {
      addPredicates(uniq([...selectedPredicates, uri]));
    },
  }),
  mapProps(({ predicateList, sheetId, column, row, ...rest }) => ({
    list: predicateList,
    id: predicateInputId(sheetId, column, row),
    ...rest,
  })),
)(CellToolTip);
