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
  searchInputRepositoryId,
}                            from '../../redux/modules/focus';
import AutocompleteContainer from '../AutocompleteContainer';


export default compose(
  withProps(({ sheetId, column, row, }) => ({
    id: searchInputRepositoryId(sheetId, column, row),
    placeholder: 'repository',
  })),
  mapPropsStream(connectFalcor(({ id, focus, }) => (
    equals(id, focus) ? [['ontology', 'repositories']] : null
  ))),
  withProps(({ graphFragment, }) => ({
    list: pipe(
      pathOr([], ['json', 'ontology', 'repositories', 'value']),
      map((repoName) => ({ uri: repoName, label: repoName, }))
    )(graphFragment),
  })),
)(AutocompleteContainer);
