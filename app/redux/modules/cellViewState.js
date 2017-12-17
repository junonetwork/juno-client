import R                  from 'ramda';
import {
  batchActions,
}                         from 'redux-batched-actions';
import {
  generateTableId,
}                         from '../../utils/sheet';
import {
  formatAddress,
}                         from '../../utils/cell';
import {
  getSheetMaxColumn,
  getSheetMaxRow,
  increaseSheetMaxColumn,
  increaseSheetMaxRow,
}                         from './sheets';
import {
  setCellFocus,
}                         from './focus';
// import {
//   ADD_CELL_TO_CLIPBOARD,
//   CLEAR_CLIPBOARD,
// }                         from './clipboard';


/**
 * utils
 */


/**
 * constants
 */
export const ADD_ENHANCED_STATE = 'ADD_ENHANCED_STATE';
export const REMOVE_ENHANCED_STATE = 'REMOVE_ENHANCED_STATE';
export const ADD_TEASER_STATE = 'ADD_TEASER_STATE';
export const CLEAR_TEASER_STATE = 'CLEAR_TEASER_STATE';


/**
 * action creators
 */
// is enhanced a cell state or a node state?
// if a node is moved, should the enhanced state move w/ it? [in which case it is not viewState]
export const addEnhancedState = (sheetId, address) =>
  ({ type: ADD_ENHANCED_STATE, sheetId, address });
export const removeEnhancedState = (sheetId, address) =>
  ({ type: REMOVE_ENHANCED_STATE, sheetId, address });


/**
 * reducer
 */
export default (state = {}, action) => {
  if (action.type === ADD_TEASER_STATE) {
    const id = generateTableId(action.sheetId, action.address);
    return {
      ...state,
      [id]: {
        ...state[id],
        teaser: true,
      },
    };
  } else if (action.type === ADD_ENHANCED_STATE) {
    const id = generateTableId(action.sheetId, action.address);
    return {
      ...state,
      [id]: {
        ...state[id],
        enhanced: true,
      },
    };
  } else if (action.type === REMOVE_ENHANCED_STATE) {
    const id = generateTableId(action.sheetId, action.address);

    if (state[id] && state[id].enhanced && Object.keys(state[id]).length === 1) {
      return R.omit([id], state);
    }

    return {
      ...state,
      [id]: R.omit(['enhanced'], state[id]),
    };
  }
  // } else if (action.type === ADD_CELL_TO_CLIPBOARD) {
  //   const id = generateTableId(action.sheetId, action.address);

  //   return R.compose(
  //     mergeLeft({
  //       [id]: {
  //         ...state[id] || {},
  //         copied: true,
  //       },
  //     }),
  //     R.reject((node) => Object.keys(node).length === 0),
  //     R.map(R.omit(['copied']))
  //   )(state);
  // } else if (action.type === CLEAR_CLIPBOARD) {
  //   return R.compose(
  //     R.reject((node) => Object.keys(node).length === 0),
  //     R.map(R.omit(['copied']))
  //   )(state);
  // }

  return state;
};


/**
 * epics
 */
