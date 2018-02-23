import {
  propEq,
}                        from 'ramda';
import { from }          from 'rxjs/observable/from';
import { of }            from 'rxjs/observable/of';
import {
  filter,
  mergeMap,
  mapTo,
  catchError,
}                        from 'rxjs/operators';
import model             from '../../falcor/model';


/**
 * constants
 */
export const UPDATE_GRAPH_VALUE = 'UPDATE_GRAPH_VALUE';
export const UPDATE_GRAPH_VALUE_SUCCESS = 'UPDATE_GRAPH_VALUE_SUCCESS';
export const UPDATE_GRAPH_VALUE_ERROR = 'UPDATE_GRAPH_VALUE_ERROR';
export const DELETE_GRAPH_VALUE = 'DELETE_GRAPH_VALUE';
export const DELETE_GRAPH_VALUE_SUCCESS = 'DELETE_GRAPH_VALUE_SUCCESS';
export const DELETE_GRAPH_VALUE_ERROR = 'DELETE_GRAPH_VALUE_ERROR';


/**
 * action creators
 */
export const updateGraphValue = (path, value) =>
  ({ type: UPDATE_GRAPH_VALUE, path, value, });
export const deleteGraphValue = (path) =>
  ({ type: DELETE_GRAPH_VALUE, path, });


/**
 * reducer
 */


/**
 * epics
 */
export const updateGraphValueEpic = () => (action$) => (
  action$.pipe(
    filter(propEq('type', UPDATE_GRAPH_VALUE)),
    mergeMap((action) => (
      from(model.setValue(action.path, action.value)).pipe(
        mapTo({ type: UPDATE_GRAPH_VALUE_SUCCESS, }),
        catchError((error) => of({ type: UPDATE_GRAPH_VALUE_ERROR, error, }))
      )
    )),
    catchError((error, caught) => {
      console.error('Error Updating Graph Value:', error);
      return caught;
    })
  )
);


export const deleteGraphValueEpic = () => (action$) => (
  action$.pipe(
    filter(propEq('type', DELETE_GRAPH_VALUE)),
    mergeMap((action) => (
      // TODO - set to null? or call delete?
      from(model.setValue(action.path, null))
        .mapTo({ type: DELETE_GRAPH_VALUE_SUCCESS, })
        .catch((error) => of({ type: DELETE_GRAPH_VALUE_ERROR, error, }))
    )),
    catchError((error, caught) => {
      console.error('Error Deleting Graph Value:', error);
      return caught;
    })
  )
);
