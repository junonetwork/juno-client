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
  searchInputRepositoryId,
}                            from '../../redux/modules/focus';
import AutocompleteContainer from '../AutocompleteContainer';


export default compose(
  mapPropsStream(connectFalcor(() => ([
    ['ontology', 'repositories'],
  ]))),
  withProps(({ sheetId, column, row, graphFragment, }) => ({
    id: searchInputRepositoryId(sheetId, column, row),
    list: pipe(
      pathOr([], ['json', 'ontology', 'repositories', 'value']),
      map((repoName) => ({ uri: repoName, label: repoName, }))
    )(graphFragment),
    placeholder: 'repository',
  })),
)(AutocompleteContainer);
