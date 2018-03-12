import React from 'react';
import {
  pipe,
  pathOr,
  map,
  equals,
}                            from 'ramda';
import {
  compose,
  withProps,
  withHandlers,
}                            from 'recompose';
import mapPropsStream        from '../../falcor/mapPropsStream';
import connectFalcor         from '../../falcor/connect';
import withHotKeys           from '../../hoc/withHotKeys';
import {
  cellId,
  searchRepositoryInputId,
  searchTypeInputId,
  searchTypeInputAutocompleteId,
  setFocus,
}                            from '../../redux/modules/focus';
import Autocomplete          from '../AutocompleteContainer';
import store                 from '../../redux/store';

const { dispatch, } = store;


const SearchInputType = ({
  sheetId, column, row, type, list, lineHeight, focus, hotKeys,
  setType, enterInput, exitInput,
}) => (
  <div
    className="search-line"
    style={{ lineHeight, }}
    {...hotKeys}
  >
    <span className="search-label">For</span>
    <Autocomplete
      id={searchTypeInputAutocompleteId(sheetId, column, row)}
      value={type}
      list={list}
      placeholder="type"
      focus={focus}
      lineHeight={lineHeight}
      onChange={setType}
      enter={enterInput}
      exit={exitInput}
    />
  </div>
);

export default compose(
  mapPropsStream(connectFalcor(({ focus, sheetId, column, row, repository, }) => (
    equals(focus, searchTypeInputAutocompleteId(sheetId, column, row)) ?
      [['ontology', repository, 'types']] :
      null
  ))),
  withProps(({ repository, graphFragment, }) => ({
    list: pipe(
      pathOr([], ['json', 'ontology', repository, 'types', 'value']),
      map(({ uri, label, }) => ({ uri, label, }))
    )(graphFragment),
  })),
  withHandlers({
    enterInput: ({
      tableId, repository, create, update,
    }) => (type, idx) => {
      // TODO - validate search
      if (idx !== -1 && tableId !== undefined) {
        update(repository, type);
      } else if (idx !== -1) {
        create(repository, type);
      }
    },
    exitInput: ({
      sheetId, column, row, setType,
    }) => () => {
      setType('');
      dispatch(setFocus(searchTypeInputId(sheetId, column, row)));
    },
  }),
  withHotKeys(
    ({ sheetId, column, row, }) => searchTypeInputId(sheetId, column, row),
    {
      down: () => (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      up: ({ sheetId, column, row, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(setFocus(searchRepositoryInputId(sheetId, column, row)));
      },
      enter: ({
        sheetId, column, row,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(setFocus(searchTypeInputAutocompleteId(sheetId, column, row)));
      },
      esc: ({ sheetId, column, row, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(setFocus(cellId(sheetId, column, row)));
      },
    },
  ),
)(SearchInputType);
