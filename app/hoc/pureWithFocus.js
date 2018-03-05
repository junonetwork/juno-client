import {
  equals,
  path,
  omit,
}                         from 'ramda';
import {
  shouldUpdate,
  shallowEqual,
}                         from 'recompose';


const omitFocus = omit(['focus']);

const updateRowFocus = (props, nextProps) => (
  !equals(props.focus, nextProps.focus) && (
    (
      path(['focus', 'sheetId'], props) === props.row[0].sheetId &&
      path(['focus', 'row'], props) === props.row[0].row
    ) || (
      path(['focus', 'sheetId'], nextProps) === nextProps.row[0].sheetId &&
      path(['focus', 'row'], nextProps) === nextProps.row[0].row
    )
  )
);

const updateCellFocus = (props, nextProps) => (
  !equals(props.focus, nextProps.focus) && (
    (
      path(['focus', 'sheetId'], props) === props.sheetId &&
      path(['focus', 'row'], props) === props.row &&
      path(['focus', 'column'], props) === props.column
    ) || (
      path(['focus', 'sheetId'], nextProps) === nextProps.sheetId &&
      path(['focus', 'row'], nextProps) === nextProps.row &&
      path(['focus', 'column'], nextProps) === nextProps.column
    )
  )
);

// only update rows if focus changes and if focus left or entered row
export const pureRowWithFocus = shouldUpdate((props, nextProps) => (
  // !rowFocusEquality(props, nextProps) ||
  updateRowFocus(props, nextProps) ||
  !shallowEqual(omitFocus(props), omitFocus(nextProps))
));

export const pureCellWithFocus = shouldUpdate((props, nextProps) => (
  // !cellFocusEquality(props, nextProps) ||
  updateCellFocus(props, nextProps) ||
  !shallowEqual(omitFocus(props), omitFocus(nextProps))
));
