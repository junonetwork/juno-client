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
  !equals(focus, nextFocus) && (
    (
      focus.sheetId === row[0].sheetId &&
      focus.row === row[0].row
    ) || (
      nextFocus.sheetId === nextRow[0].sheetId &&
      nextFocus.row === nextRow[0].row
    )
  )
);

const updateCellFocus = (
  { focus, sheetId, row, column, },
  { focus: nextFocus, sheetId: nextSheetId, row: nextRow, column: nextColumn, }
) => (
  !equals(focus, nextFocus) && (
    (
      focus.sheetId === sheetId &&
      focus.row === row &&
      focus.column === column
    ) || (
      nextFocus.sheetId === nextSheetId &&
      nextFocus.row === nextRow &&
      nextFocus.column === nextColumn
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
