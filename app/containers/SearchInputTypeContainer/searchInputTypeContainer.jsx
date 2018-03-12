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
import NavigableAutocomplete from '../../components/NavigableAutocomplete';
import store                 from '../../redux/store';

const { dispatch, } = store;


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
      map(({ uri, label, }) => ({ uri, label, }))
    )(graphFragment),
  })),
  withHandlers({
    enterInput: ({
      tableId, repository, list, create, update,
    }) => (type, idx) => {
      // TODO - validate search
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
)(NavigableAutocomplete);
