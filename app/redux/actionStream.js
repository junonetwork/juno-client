import {
  createEventHandlerWithConfig,
}                                 from 'recompose';
import { from }                   from 'rxjs/observable/from';
import { merge }                  from 'rxjs/observable/merge';
import { batchActions }           from 'redux-batched-actions';
import {
  compose,
  equals,
  prop,
  identity,
}                                 from 'ramda';
import {
  catchError,
}                                 from 'rxjs/operators';


export const STREAM = '@__STREAM';
export const streamAction = (action) => (action.STREAM = true, action);

export default (epics) => ({ dispatch, getState }) => {
  console.log('INIT');
  const { handler, stream, } = createEventHandlerWithConfig({
    fromESObservable: from,
    toESObservable: identity,
  })();

  merge(
    ...epics.map((epic) => stream.pipe(epic(getState)))
  )
    .pipe(catchError((error, caught) => {
      console.error('Uncaught error on the action stream middleware:', error);
      return caught;
    }))
    .subscribe({
      next: (action) => {
        if (Array.isArray(action)) {
          dispatch(batchActions(action, 'ACTION_STREAM'));
        } else {
          dispatch(action);
        }
      },
    });

  return (next) => (action) => {
    if (action.STREAM) {
      return handler(action);
    }

    return next(action);
  };
};
