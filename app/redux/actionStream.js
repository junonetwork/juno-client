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


export default (store, epics) => {
  const { handler, stream, } = createEventHandlerWithConfig({
    fromESObservable: from,
    toESObservable: identity,
  })();

  merge(
    ...epics.map((epic) => stream.pipe(epic(store)))
  )
    .pipe(catchError((error, caught) => {
      console.error('Uncaught error on the action stream:', error);
      return caught;
    }))
    .subscribe({
      next: (action) => {
        if (Array.isArray(action)) {
          store.dispatch(batchActions(action, 'ACTION_STREAM'));
        } else if (action !== null && action !== undefined) {
          store.dispatch(action);
        }
      },
    });

  return handler;
};


export const ofType = (type) => compose(equals(type), prop('type'));
