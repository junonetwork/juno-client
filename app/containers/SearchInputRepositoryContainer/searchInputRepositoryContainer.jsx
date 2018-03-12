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
  searchRepositoryInputAutocompleteId,
  searchTypeInputId,
  setFocus,
}                            from '../../redux/modules/focus';
import Autocomplete          from '../AutocompleteContainer';
import store                 from '../../redux/store';

const { dispatch, } = store;


const SearchInputRepository = ({
  sheetId, column, row, repository, list, lineHeight, focus, hotKeys,
  setRepository, enterInput, exitInput,
}) => (
  <div
    className="search-line"
    style={{ lineHeight, }}
    {...hotKeys}
  >
    <span className="search-label">Search</span>
    <Autocomplete
      id={searchRepositoryInputAutocompleteId(sheetId, column, row)}
      value={repository}
      list={list}
      placeholder="repository"
      focus={focus}
      lineHeight={lineHeight}
      onChange={setRepository}
      enter={enterInput}
      exit={exitInput}
    />
  </div>
);

export default compose(
  mapPropsStream(connectFalcor(({ focus, sheetId, column, row, }) => (
    equals(focus, searchRepositoryInputAutocompleteId(sheetId, column, row)) ?
      [['ontology', 'repositories']] :
      null
  ))),
  withProps(({ graphFragment, }) => ({
    list: pipe(
      pathOr([], ['json', 'ontology', 'repositories', 'value']),
      map((repoName) => ({ uri: repoName, label: repoName, }))
    )(graphFragment),
  })),
  withHandlers({
    enterInput: ({
      sheetId, column, row, setRepository,
    }) => (repository, idx) => {
      if (idx !== -1) {
        setRepository(repository);
        dispatch(setFocus(searchTypeInputId(sheetId, column, row)));
      }
    },
    exitInput: ({
      sheetId, column, row, setRepository,
    }) => () => {
      setRepository('');
      dispatch(setFocus(searchRepositoryInputId(sheetId, column, row)));
    },
  }),
  withHotKeys(
    ({ sheetId, column, row, }) => searchRepositoryInputId(sheetId, column, row),
    {
      down: ({ sheetId, column, row, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        dispatch(setFocus(searchTypeInputId(sheetId, column, row)));
      },
      up: () => (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      enter: ({
        sheetId, column, row,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(setFocus(searchRepositoryInputAutocompleteId(sheetId, column, row)));
      },
      esc: ({ sheetId, column, row, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(setFocus(cellId(sheetId, column, row)));
      },
    },
  ),
)(SearchInputRepository);
