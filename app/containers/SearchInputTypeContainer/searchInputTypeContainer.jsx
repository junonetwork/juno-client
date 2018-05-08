import {
  pipe,
  pathOr,
  map,
  equals,
  filter,
  prop,
  test,
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
import NavigableAutocomplete from '../../components/NavigableAutocomplete';
import store                 from '../../redux/store';


// TODO - prevent type input when repository is not specified
export default compose(
  mapPropsStream(connectFalcor(({ focus, sheetId, column, row, repository, }) => (
    equals(focus, searchTypeInputAutocompleteId(sheetId, column, row)) ?
      [['ontology', repository, 'types']] :
      null
  ))),
  withProps(({
    sheetId, column, row, repository, typeLabel, graphFragment,
  }) => ({
    placeholder: 'type',
    value: typeLabel,
    autocompleteFocusId: searchTypeInputAutocompleteId(sheetId, column, row),
    list: pipe(
      pathOr([], ['json', 'ontology', repository, 'types', 'value']),
      map(({ uri, label, }) => ({ uri, label, })),
      filter(pipe(prop('label'), test(RegExp(typeLabel, 'i'))))
    )(graphFragment),
  })),
  withHandlers({
    enterInput: ({
      tableId, repository, list, create, update,
    }) => (type, idx) => {
      if (idx !== -1 && tableId !== undefined) {
        update(repository, type, list[idx].label);
      } else if (idx !== -1) {
        create(repository, type, list[idx].label);
      }
    },
    exitInput: ({
      sheetId, column, row, setInput,
    }) => () => {
      setInput('');
      store.dispatch(setFocus(searchTypeInputId(sheetId, column, row)));
    },
  }),
  withHotKeys(
    ({ sheetId, column, row, }) => searchTypeInputId(sheetId, column, row),
    {
      down: () => () => {},
      up: ({ sheetId, column, row, }) => () => {
        store.dispatch(setFocus(searchRepositoryInputId(sheetId, column, row)));
      },
      enter: ({ sheetId, column, row, setInput, }) => () => {
        setInput('');
        store.dispatch(setFocus(searchTypeInputAutocompleteId(sheetId, column, row)));
      },
      esc: ({ sheetId, column, row, }) => () => {
        store.dispatch(setFocus(cellId(sheetId, column, row)));
      },
    },
  ),
)(NavigableAutocomplete);
