import {
  compose,
  withStateHandlers,
  withProps,
  withHandlers,
}                            from 'recompose';
import {
  batchActions,
}                            from 'redux-batched-actions';
import {
  searchInputId,
  cellId,
  setFocus,
}                            from '../../redux/modules/focus';
import {
  addSearchCollectionTable,
  replaceSearchCollection,
  createSearchDescriptor,
}                            from '../../redux/modules/tables';
import {
  formatAddress,
}                            from '../../utils/cell';
import {
  generateTableId,
}                            from '../../utils/table';
import withHotKeys           from '../../hoc/withHotKeys';
import SearchInput           from '../../components/SearchInput';
import store                 from '../../redux/store';

const { dispatch } = store;
const searchIsValid = (repository, type, typeLabel) =>
  repository && type && typeLabel;


// TODO - it might make sense to separate repository/type label input, which changes
// w/ keystroke input and is often invalid
// from repository/type id, which only changes w/ autocomplete submit
export default compose(
  withStateHandlers(
    ({ search: { repository = '', type = '', typeLabel = '', } = {}, }) => ({
      repository,
      type,
      typeLabel,
    }),
    {
      setRepository: () => (repository) => ({
        repository, typeLabel: '', type: '',
      }),
      setType: () => (typeLabel) => ({ typeLabel, }),
    }
  ),
  withProps(({ repository, type, typeLabel, }) => ({
    searchIsValid: searchIsValid(repository, type, typeLabel),
  })),
  withHandlers({
    create: ({
      sheetId, column, row,
    }) => (repository, type, typeLabel) => {
      if (!searchIsValid(repository, type, typeLabel)) {
        return;
      }

      dispatch(batchActions([
        addSearchCollectionTable(
          sheetId,
          generateTableId(),
          formatAddress(sheetId, column, row),
          createSearchDescriptor(repository, type, typeLabel),
          ['skos:prefLabel'],
          [{ from: 0, to: 2, }],
          repository,
          type
        ),
        setFocus(cellId(sheetId, column, row)),
      ]));
    },
    update: ({
      tableId, sheetId, column, row,
    }) => (repository, type, typeLabel) => {
      if (!searchIsValid(repository, type, typeLabel)) {
        return;
      }

      dispatch(batchActions([
        replaceSearchCollection(tableId, repository, type, typeLabel),
        setFocus(cellId(sheetId, column, row)),
      ]));
    },
    exit: ({ sheetId, column, row, }) => () => (
      dispatch(setFocus(cellId(sheetId, column, row)))
    ),
  }),
  // TODO - replace w/ blank focus HOC
  withHotKeys(
    ({ sheetId, column, row, }) => searchInputId(sheetId, column, row),
  ),
)(SearchInput);
