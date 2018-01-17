import {
  createEventHandlerWithConfig,
}                                 from 'recompose';
import { from }                   from 'rxjs/observable/from';
import { merge }                  from 'rxjs/observable/merge';
import { batchActions }           from 'redux-batched-actions';


export default (store, epics) => {
  const { handler, stream } = createEventHandlerWithConfig({
    fromESObservable: from,
    toESObservable: stream => stream,
  })();

  merge(
    ...epics.map((epic) => stream.pipe(epic(store)))
  )
    .subscribe({
      next: (action) => {
        if (Array.isArray(action)) {
          store.dispatch(batchActions(action)); 
        } else {
          store.dispatch(action); 
        }
      },
      error: (error) => {
        console.error('Redux Event Stream Error', error);
      }
    });

  return handler;
};

