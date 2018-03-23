import {
  createEventHandlerWithConfig,
}                                 from 'recompose';
import { from }                   from 'rxjs/observable/from';
import { merge }                  from 'rxjs/observable/merge';
import {
  identity,
}                                 from 'ramda';
import {
  catchError,
}                                 from 'rxjs/operators';


export const STREAM = '@__STREAM';
export const streamAction = (action) => (action.STREAM = true, action);

export default (epics) => ({ dispatch, getState, }) => (next) => {
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
      next: dispatch,
    });

  return (action) => {
    if (action.STREAM) {
      return handler(action);
    }

    return next(action);
  };
};
