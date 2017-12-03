/* eslint-disable no-underscore-dangle */
import {
  Observable,
} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/last';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/repeatWhen';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/auditTime';
import {
  isPaths,
} from '../utils/falcor';
import model, {
  graphChange$,
}                       from './model';


const connect = (falcorModel, graphChange$) => (
  paths,
  {
    errorHandler = (error, props) => Observable.of({
      ...props, graphFragment: {}, graphFragmentStatus: 'error', error,
    }),
  } = {}
) => props$ => (
  props$
    // valid optimization?
    // .map(props => Object.assign(props, { path: typeof paths === 'function' ? paths(props) : paths}))
    // .distinctUntilChanged(({ path }, { path: nextPath }) => shallowEquals(path, nextPath))
    .switchMap((props) => {
      const _paths = typeof paths === 'function' ? paths(props) : paths;

      if (!_paths) {
        return Observable.of({ ...props, graphFragment: {}, graphFragmentStatus: 'complete' });
      } else if (_paths instanceof Error) {
        return Observable.of({
          ...props, graphFragment: {}, graphFragmentStatus: 'error', error: _paths.message,
        });
      }

      // validate input
      if (!isPaths(_paths)) {
        console.error(
          'Expected an array of paths, e.g [["todos", 0, "title"],["todos", "length"]].  Received:',
          _paths
        );
        return Observable.of({
          ...props,
          graphFragment: {},
          graphFragmentStatus: 'error',
          error: `Expected an array of paths, e.g [["todos", 0, "title"],["todos", "length"]].  Received ${JSON.stringify(_paths)}`,
        });
      }

      // Netflix model implementation
      const graphQuery$ = Observable.from(falcorModel.get(..._paths).progressively());

      return Observable.merge(
        graphQuery$
          .startWith({})
          .map(graphFragment => ({ ...props, graphFragment, graphFragmentStatus: 'next' }))
          .catch((err, caught) => errorHandler(err, props, caught)),
        graphQuery$
          .last()
          .catch(() => Observable.empty())
          .map(graphFragment => ({ ...props, graphFragment, graphFragmentStatus: 'complete' }))
      )
        .repeatWhen(() => graphChange$)
        .auditTime(0); // audit time screws everything up: latency perf tests, input cursors jumping to end in input
    })
);

export default connect(model, graphChange$);
