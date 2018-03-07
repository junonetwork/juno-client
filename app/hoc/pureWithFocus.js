import {
  equals,
  omit,
}                         from 'ramda';
import {
  shouldUpdate,
  shallowEqual,
}                         from 'recompose';


const omitFocus = omit(['focus']);


const updateRowFocus = ({ focus, row, }, { focus: nextFocus, row: nextRow, }) => (
  !equals(focus, focus) && (
    (
      focus.sheetId === row[0].sheetId &&
      focus.row === row[0].row
    ) || (
      nextFocus.sheetId === nextRow[0].sheetId &&
      nextFocus.row === nextRow[0].row
    )
  )
);

const updateCellFocus = ({ focus, row, }, { focus: nextFocus, row: nextRow, }) => (
  !equals(focus, focus) && (
    (
      focus.sheetId === row[0].sheetId &&
      focus.row === row[0].row &&
      focus.column === row[0].column
    ) || (
      nextFocus.sheetId === nextRow[0].sheetId &&
      nextFocus.row === nextRow[0].row &&
      nextFocus.column === nextRow[0].column
    )
  )
);


// only update rows if focus changes and if focus left or entered row
export const pureRowWithFocus = shouldUpdate((props, nextProps) => (
  updateRowFocus(props, nextProps) ||
  !shallowEqual(omitFocus(props), omitFocus(nextProps))
));

export const pureCellWithFocus = shouldUpdate((props, nextProps) => (
  updateCellFocus(props, nextProps) ||
  !shallowEqual(omitFocus(props), omitFocus(nextProps))
));
