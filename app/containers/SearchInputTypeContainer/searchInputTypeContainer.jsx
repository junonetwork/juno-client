import {
  pipe,
  pathOr,
  map,
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
  mapPropsStream(connectFalcor(({ repository, }) => ([
    ['ontology', repository, 'types'],
  ]))),
  withProps(({ repository, sheetId, column, row, graphFragment, }) => ({
    id: searchInputTypeId(sheetId, column, row),
    list: pipe(
      pathOr([], ['json', 'ontology', repository, 'types', 'value']),
      map(({ uri, label, }) => ({ uri, label, }))
    )(graphFragment),
    placeholder: 'type',
  })),
)(AutocompleteContainer);
