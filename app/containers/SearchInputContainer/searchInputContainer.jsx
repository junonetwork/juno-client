import {
  equals,
}                            from 'ramda';
import {
  compose,
  withStateHandlers,
  withHandlers,
}                            from 'recompose';
import {
  batchActions,
}                            from 'redux-batched-actions';
import {
  searchInputId,
  searchInputRepositoryId,
  searchInputTypeId,
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
    ({ search: { repository = '', type = '', } = {}, }) => ({
      repository,
      type,
    }),
    {
      setRepository: () => (repository) => ({ repository, }),
      setType: () => (type) => ({ type, }),
    }
  ),
  withHandlers({
    create: ({
      sheetId, column, row,
    }) => (repository, type) => {
      dispatch(batchActions([
        addSearchCollectionTable(
          sheetId,
          generateTableId(),
          formatAddress(sheetId, column, row),
          { repository, type, },
          ['schema:name', 'schema:birthPlace'],
          [{ from: 0, to: 2, }]
        ),
        setFocus(cellId(sheetId, column, row)),
      ]));
    },
    update: ({
      tableId, sheetId, column, row,
    }) => (repository, type) => {
      dispatch(batchActions([
        replaceSearchCollection(tableId, repository, type),
        setFocus(cellId(sheetId, column, row)),
      ]));
    },
    exit: ({ sheetId, column, row, }) => () => (
      dispatch(setFocus(cellId(sheetId, column, row)))
    ),
  }),
  // TODO - much of this can be moved to searchInputRepository/TypeContainer
  // withHotKeys decorator on this contianer should just prevent clicking on a non-input part of this component
  // from focusing on cellId and losing focus on input
  // TODO - searchInputRepository/TypeContainer should include label, so clicking on label focused input
  withHandlers({
    enterRepository: ({
      sheetId, column, row, setRepository,
    }) => (repository) => {
      // TODO - entering non-existent type (selectionIdx === -1) should cancel enter
      if (repository) {
        setRepository(repository);
        dispatch(setFocus(searchInputTypeId(sheetId, column, row)));
      } else {
        setRepository('');
        dispatch(setFocus(searchInputTypeId(sheetId, column, row)));
      }
    },
    exitRepository: ({
      sheetId, column, row, setRepository,
    }) => () => {
      setRepository('');
      dispatch(setFocus(searchInputId(sheetId, column, row)));
    },
    enterType: ({
      tableId, sheetId, column, row, repository, setType, create, update,
    }) => (type) => {
      // TODO - validate search
      // TODO - entering non-existent type (selectionIdx === -1) should cancel enter
      if (type && tableId !== undefined) {
        update(repository, type);
      } else if (type) {
        create(repository, type);
      } else {
        setType('');
        dispatch(setFocus(searchInputRepositoryId(sheetId, column, row)));
      }
    },
    exitType: ({
      sheetId, column, row, setType,
    }) => () => {
      setType('');
      dispatch(setFocus(searchInputId(sheetId, column, row)));
    },
  }),
  withHotKeys(
    ({ sheetId, column, row, }) => searchInputId(sheetId, column, row),
    {
      down: ({ focus, sheetId, column, row, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (equals(focus, searchInputId(sheetId, column, row))) {
          dispatch(setFocus(searchInputRepositoryId(sheetId, column, row)));
        }
      },
      up: ({ focus, sheetId, column, row, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (equals(focus, searchInputId(sheetId, column, row))) {
          dispatch(setFocus(searchInputTypeId(sheetId, column, row)));
        }
      },
      enter: ({
        tableId, repository, type, create, update,
      }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO - validate search
        if (tableId !== undefined) {
          update(repository, type);
        } else {
          create(repository, type);
        }
      },
      esc: ({ exit, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        exit();
      },
    },
  ),
)(SearchInput);
