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
  withStateHandlers,
}                            from 'recompose';
import { batchActions }      from 'redux-batched-actions';
import PredicateInput        from '../../components/PredicateInput';
import withHotKeys           from '../../hoc/withHotKeys';
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
          clearCellInput(sheetId, column, row),
        ]));
      },
      exit: () => {
        dispatch(batchActions([
          removeEnhancedCell(sheetId, column, row),
          clearCellInput(sheetId, column, row),
        ]));
      },
    })
  ),
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
    addPredicates: ({ existingPredicates, predicateIdx, submit, }) => (newPredicates) => {
      if (newPredicates.length === 0) {
        // do nothing
      } else if (typeof predicateIdx === 'number') {
        const [firstPredicate, ...restPredicates] = newPredicates;
        // cell is predicate type - replace existing predicate w/ first new predicate and append rest
        submit([...update(predicateIdx, firstPredicate, existingPredicates), ...restPredicates]);
      } else {
        // cell is empty type - append all new predicates
        submit([...existingPredicates, ...newPredicates]);
      }
    },
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
  }),
  withHotKeys(
    () => true,
    {
      up: ({ backwardSelect, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        backwardSelect();
      },
      down: ({ forwardSelect, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        forwardSelect();
      },
      'shift+up': ({ backwardSelect, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        backwardSelect();
      },
      'shift+down': ({ forwardSelect, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        forwardSelect();
      },
      left: arrowKeyNavHandler,
      right: arrowKeyNavHandler,
      'alt+left': arrowKeyNavHandler,
      'alt+right': arrowKeyNavHandler,
      'alt+up': arrowKeyNavHandler,
      'alt+down': arrowKeyNavHandler,
      enter: ({
        selectedPredicates, predicateList, selectionIdx, addPredicates,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (selectionIdx === -1) {
          addPredicates(selectedPredicates);
        } else {
          addPredicates(uniq([...selectedPredicates, predicateList[selectionIdx].uri]));
        }
      },
      // TODO - allow for multiple selections at the same time
      'shift+enter': ({
        selectedPredicates, predicateList, selectionIdx,
        addPredicates, selectPredicate, unselectPredicate,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (selectionIdx === -1) {
          addPredicates(selectedPredicates);
        } else if (predicateList[selectionIdx].selected) {
          unselectPredicate(predicateList[selectionIdx]);
        } else {
          selectPredicate(predicateList[selectionIdx]);
        }
      },
      esc: ({ exit, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        exit();
      },
      delete: ({ value, }) => (e) => {
        // if user presses delete when input is empty, don't delete column
        if (value === '') {
          e.preventDefault();
          e.stopPropagation();
        }
      },
    },
    {
      onBlur: ({ exit, }) => () => exit(),
    }
  )
)(PredicateInput);
