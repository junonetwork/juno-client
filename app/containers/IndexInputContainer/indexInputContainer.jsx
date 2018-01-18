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
  clearCellInput,
}                            from '../../redux/modules/cellInput';
import {
  indicesKeySet2String,
}                            from '../../utils/sheet';
import {
  grammar,
  semantics,
}                            from '../../ohm/rangeGrammar';


const submitHandler = ({ inputIsValid, indicesFromInput, submit, exit, }) => () => {
  if (inputIsValid) {
    submit(indicesFromInput);
  } else {
    exit();
  }
};


export default compose(
  connect(
    (state, { tableId, }) => {
      const { indices, } = getTable(state, tableId);

      return { indicesRangeString: indicesKeySet2String(indices), };
    },
    (dispatch, { column, row, sheetId, tableId, }) => ({
      submit(indicesKeySet) {
        dispatch(batchActions([
          removeEnhancedCell(sheetId, column, row),
          replaceIndices(tableId, indicesKeySet),
          clearCellInput(sheetId, column, row),
        ]));
      },
      exit() {
        dispatch(batchActions([
          removeEnhancedCell(sheetId, column, row),
          clearCellInput(sheetId, column, row),
        ]));
      },
    })
  ),
  // TODO - it should be possible to store this in cellInput
  withState('indicesRangeString', 'setIndicesRangeString', R.prop('indicesRangeString')),
  withProps(({ indicesRangeString, }) => {
    const parsedIndicesRangeString = grammar.match(indicesRangeString);

    return parsedIndicesRangeString.succeeded() ?
      {
        indicesFromInput: semantics(parsedIndicesRangeString).interpret(),
        inputIsValid: true,
      } :
      {
        indicesFromInput: false,
        inputIsValid: false,
      };
  }),
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
      enter: ({ inputIsValid, indicesFromInput, submit, exit, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        submitHandler({ inputIsValid, indicesFromInput, submit, exit, })();
      },
      esc: ({ exit, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        exit();
      },
      delete: ({ indicesRangeString, setIndicesRangeString, }) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIndicesRangeString(indicesRangeString.slice(0, -1));
      },
    },
    {
      onBlur: ({ exit, }) => () => exit(),
    }
  ),
  withHandlers({
    onKeyPress: ({ indicesRangeString, setIndicesRangeString, }) => (e) => {
      e.preventDefault();
      e.stopPropagation();

      setIndicesRangeString(indicesRangeString + String.fromCharCode(e.which));
    },
  })
)(IndexInput);
