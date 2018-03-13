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

const { dispatch, } = store;


export default compose(
  withStateHandlers(
    ({ search: { repository = '', type = '', typeLabel = '', } = {}, }) => ({
      repository,
      type,
      typeLabel,
    }),
    {
      setRepository: () => (repository) => ({ repository, }),
      setTypeLabel: () => (typeLabel) => ({ typeLabel, }),
    }
  ),
  withProps(({ repository, type, }) => ({
    searchIsValid: repository && type,
  })),
  withHandlers({
    create: ({
      searchIsValid, sheetId, column, row,
    }) => (repository, type, typeLabel) => {
      if (!searchIsValid) {
        return;
      }

      dispatch(batchActions([
        addSearchCollectionTable(
          sheetId,
          generateTableId(),
          formatAddress(sheetId, column, row),
          { repository, type, typeLabel, },
          ['schema:name'],
          [{ from: 0, to: 2, }]
        ),
        setFocus(cellId(sheetId, column, row)),
      ]));
    },
    update: ({
      searchIsValid, tableId, sheetId, column, row,
    }) => (repository, type, typeLabel) => {
      if (!searchIsValid) {
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
