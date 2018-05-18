import {
  reject,
  propEq,
}                                    from 'ramda';


/**
 * selectors
 */
export const getWindows = (state) => state.windows;


/**
 * constants
 */
export const CREATE_WINDOW = 'CREATE_WINDOW';

export const DELETE_WINDOW = 'DELETE_WINDOW';


/**
 * action creators
 */
export const createWindow = (id, windowType) => ({
  type: CREATE_WINDOW, id, windowType,
});

export const deleteWindow = (id) => ({
  type: DELETE_WINDOW, id,
});


/**
 * reducer
 */
// TODO - do windows need an ID, or can we id by array index
export default (
  state = [
    { id: '0', type: 'sheet' },
  ],
  action
) => {
  if (action.type === CREATE_WINDOW) {
    return [{ id: action.id, type: action.windowType }, ...state];
  } else if (action.type === DELETE_WINDOW) {
    return reject(propEq('id', action.id), state);
  }

  return state;
};
