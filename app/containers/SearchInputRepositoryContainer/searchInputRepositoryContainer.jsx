import {
  pipe,
  pathOr,
  map,
  equals,
  filter,
  test,
  prop,
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
import NavigableAutocomplete from '../../components/NavigableAutocomplete';
import store                 from '../../redux/store';


export default compose(
  mapPropsStream(connectFalcor(({ focus, sheetId, column, row, }) => (
    equals(focus, searchRepositoryInputAutocompleteId(sheetId, column, row)) ?
      [['ontology', 'repositories']] :
      null
  ))),
  withProps(({ repository, sheetId, column, row, graphFragment, }) => ({
    placeholder: 'repository',
    value: repository,
    autocompleteFocusId: searchRepositoryInputAutocompleteId(sheetId, column, row),
    list: pipe(
      pathOr([], ['json', 'ontology', 'repositories', 'value']),
      map((repoName) => ({ uri: repoName, label: repoName, })),
      filter(pipe(prop('label'), test(RegExp(repository, 'i'))))
    )(graphFragment),
  })),
  withHandlers({
    enterInput: ({
      sheetId, column, row, setInput,
    }) => (repository, idx) => {
      if (idx !== -1) {
        setInput(repository);
        store.dispatch(setFocus(searchTypeInputId(sheetId, column, row)));
      }
    },
    exitInput: ({
      sheetId, column, row, setInput,
    }) => () => {
      setInput('');
      store.dispatch(setFocus(searchRepositoryInputId(sheetId, column, row)));
    },
  }),
  withHotKeys(
    ({ sheetId, column, row, }) => searchRepositoryInputId(sheetId, column, row),
    {
      down: ({ sheetId, column, row, }) => () => {
        store.dispatch(setFocus(searchTypeInputId(sheetId, column, row)));
      },
      up: () => () => {},
      enter: ({ sheetId, column, row, setInput, }) => () => {
        setInput('');
        store.dispatch(setFocus(searchRepositoryInputAutocompleteId(sheetId, column, row)));
      },
      esc: ({ sheetId, column, row, }) => () => {
        store.dispatch(setFocus(cellId(sheetId, column, row)));
      },
    },
  ),
)(NavigableAutocomplete);
