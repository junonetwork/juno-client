/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  pipe,
  values,
  map,
  filter,
  reject,
  equals,
  path,
  pathOr,
  contains,
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


const ONTOLOGY_COUNT = 10;


export default compose(
  connect(
    (state, { tableId, }) => {
      // TODO - make work for objectCollection
      const { search, predicates, } = getTable(state, tableId);

      return { search, existingPredicates: predicates, };
    },
    (dispatch, { sheetId, tableId, column, row, }) => ({
      submit: (predicates) => (
        dispatch(batchActions([
          removeEnhancedCell(sheetId, column, row),
          replacePredicates(sheetId, tableId, predicates),
        ]))
      ),
      exit: () => dispatch(removeEnhancedCell(sheetId, column, row)),
    })
  ),
  mapPropsStream(connectFalcor(({ search, }) => ([
    // TODO - mapping search to URIs should move to falcor router
    ['collection', `schema:${search}`, 'ontology', { to: ONTOLOGY_COUNT - 1, }, 'count'],
    ['collection', `schema:${search}`, 'ontology', { to: ONTOLOGY_COUNT - 1, },
      'predicate', ['skos:prefLabel', 'uri'],
    ],
    ['collection', `schema:${search}`, 'ontology', 'length'],
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
  withProps(({ graphFragment, search, existingPredicates, }) => ({
    predicateList: pipe(
      pathOr([], ['json', 'collection', `schema:${search}`, 'ontology']),
      values,
      map((ontology) => ({
        uri: path(['predicate', 'uri', 'value'], ontology),
        label: path(['predicate', 'skos:prefLabel', 'value'], ontology),
      })),
      filter(({ uri, label, }) => label && uri && not(contains(uri, existingPredicates))),
    )(graphFragment),
  })),
  withHandlers({
    addPredicates: ({ existingPredicates, submit, }) => (newPredicates) => (
      submit([...existingPredicates, ...newPredicates])
    ),
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
      left: ({ selectedPredicates, addPredicates, }) => () => (
        addPredicates(selectedPredicates)
      ),
      right: ({ selectedPredicates, addPredicates, }) => () => (
        addPredicates(selectedPredicates)
      ),
      'alt+left': ({ selectedPredicates, addPredicates, }) => () => (
        addPredicates(selectedPredicates)
      ),
      'alt+right': ({ selectedPredicates, addPredicates, }) => () => (
        addPredicates(selectedPredicates)
      ),
      'alt+up': ({ selectedPredicates, addPredicates, }) => () => (
        addPredicates(selectedPredicates)
      ),
      'alt+down': ({ selectedPredicates, addPredicates, }) => () => (
        addPredicates(selectedPredicates)
      ),
      enter: ({
        selectedPredicates, predicateList, selectionIdx, addPredicates,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (selectionIdx === -1) {
          addPredicates(selectedPredicates);
        } else if (predicateList[selectionIdx].selected) {
          addPredicates(reject(equals(predicateList[selectionIdx].uri))(selectedPredicates));
        } else {
          addPredicates([...selectedPredicates, predicateList[selectionIdx].uri]);
        }
      },
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
    }
  )
)(PredicateInput);