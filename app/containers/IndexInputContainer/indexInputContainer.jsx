import R                     from 'ramda';
import { connect }           from 'react-redux';
import {
  compose,
  withState,
  withProps,
  withHandlers,
}                            from 'recompose';
import { batchActions }      from 'redux-batched-actions';
import withHotKeys           from '../../hoc/withHotKeys';
import IndexInput            from '../../components/IndexInput';
import {
  removeEnhancedCell,
}                            from '../../redux/modules/enhanced';
import {
  getTable,
  replaceIndices,
}                            from '../../redux/modules/tables';
import {
  indicesKeySet2String,
  indicesString2KeySet,
}                            from '../../utils/sheet';


const submitHandler = ({ inputIsValid, collapsedIndices, submit, exit, }) => () => (
  inputIsValid ? submit(indicesString2KeySet(collapsedIndices)) : exit()
);

export default compose(
  connect(
    (state, { tableId, }) => {
      const { indices, } = getTable(state, tableId);

      return { collapsedIndices: indicesKeySet2String(indices), };
    },
    (dispatch, { column, row, sheetId, tableId, }) => ({
      submit(indicesKeySet) {
        dispatch(batchActions([
          removeEnhancedCell(sheetId, column, row),
          replaceIndices(sheetId, tableId, indicesKeySet),
        ]));
      },
      exit() {
        dispatch(removeEnhancedCell(sheetId, column, row));
      },
    })
  ),
  withState('collapsedIndices', 'setCollapsedIndices', R.prop('collapsedIndices')),
  withProps(({ collapsedIndices, }) => ({
    inputIsValid: /^[0-9]+([,-][0-9]+)*$/.test(collapsedIndices),
  })),
  withHotKeys(
    () => true,
    {
      up: submitHandler,
      down: submitHandler,
      left: submitHandler,
      right: submitHandler,
      'alt+left': submitHandler,
      'alt+right': submitHandler,
      'alt+up': submitHandler,
      'alt+down': submitHandler,
      enter: ({ inputIsValid, collapsedIndices, submit, exit, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        submitHandler({ inputIsValid, collapsedIndices, submit, exit, })();
      },
      esc: ({ inputIsValid, collapsedIndices, submit, exit, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        submitHandler({ inputIsValid, collapsedIndices, submit, exit, })();
      },
      delete: ({ collapsedIndices, setCollapsedIndices, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCollapsedIndices(collapsedIndices.slice(0, -1));
      },
    },
    {
      onBlur: ({ exit, }) => () => exit(),
    }
  ),
  withHandlers({
    onKeyPress: ({ collapsedIndices, setCollapsedIndices, }) => (e) => {
      e.preventDefault();
      e.stopPropagation();

      setCollapsedIndices(collapsedIndices + String.fromCharCode(e.which));
    },
  })
)(IndexInput);
