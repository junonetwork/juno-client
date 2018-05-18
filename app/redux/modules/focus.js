/*
 * utils
 */
export const appId = () => 'app';

export const cellId = (sheetId, column, row) => ({
  sheetId, column, row,
});

export const searchInputId = (sheetId, column, row) => ({
  sheetId, column, row, searchInput: true,
});

export const searchRepositoryInputId = (sheetId, column, row) => ({
  sheetId, column, row, searchInput: true, repository: true,
});

export const searchRepositoryInputAutocompleteId = (sheetId, column, row) => ({
  sheetId, column, row, searchInput: true, repository: true, autocomplete: true,
});

export const searchTypeInputId = (sheetId, column, row) => ({
  sheetId, column, row, searchInput: true, type: true,
});

export const searchTypeInputAutocompleteId = (sheetId, column, row) => ({
  sheetId, column, row, searchInput: true, type: true, autocomplete: true,
});

export const predicateInputId = (sheetId, column, row) => ({
  sheetId, column, row, predicateInput: true,
});

export const indexInputId = (sheetId, column, row) => ({
  sheetId, column, row, indexInput: true,
});


/*
 * constant
 */
export const SET_FOCUS = 'SET_FOCUS';
export const CLEAR_FOCUS = 'CLEAR_FOCUS';


/*
 * selector
 */
export const getFocus = (state) => state.focus;


/*
 * action creator
 */
export const setFocus = (id) => ({ type: SET_FOCUS, id });
export const clearFocus = () => ({ type: CLEAR_FOCUS });


/*
 * reducer
 */
export default (
  state = {},
  action
) => {
  if (action.type === SET_FOCUS) {
    return action.id;
  } else if (action.type === CLEAR_FOCUS) {
    return {};
  }

  return state;
};
