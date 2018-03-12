import {
  pipe,
  pathOr,
  map,
  equals,
}                            from 'ramda';
import {
  compose,
  withProps,
}                            from 'recompose';
import mapPropsStream        from '../../falcor/mapPropsStream';
import connectFalcor         from '../../falcor/connect';
import {
  searchInputTypeId,
}                            from '../../redux/modules/focus';
import AutocompleteContainer from '../AutocompleteContainer';


export default compose(
  withProps(({ sheetId, column, row, }) => ({
    id: searchInputTypeId(sheetId, column, row),
    placeholder: 'type',
  })),
  mapPropsStream(connectFalcor(({ id, focus, repository, }) => (
    equals(id, focus) ? [['ontology', repository, 'types']] : null
  ))),
  withProps(({ repository, graphFragment, }) => ({
    list: pipe(
      pathOr([], ['json', 'ontology', repository, 'types', 'value']),
      map(({ uri, label, }) => ({ uri, label, }))
    )(graphFragment),
  })),
)(AutocompleteContainer);
