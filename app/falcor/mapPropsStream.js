import {
  Observable,
}                              from 'rxjs/Observable';
import                              'rxjs/add/observable/from';
import {
  mapPropsStreamWithConfig,
}                              from 'recompose';


export default mapPropsStreamWithConfig({
  fromESObservable: Observable.from,
  toESObservable: (stream) => stream,
});
