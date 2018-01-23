import {
  prop,
  path,
}                                 from 'ramda';
import { connect }                from 'react-redux';
import {
  compose,
  setDisplayName,
  withProps,
  withHandlers,
}                                 from 'recompose';
import {
  jsonGraphCollection2JGF,
}                                 from '../../utils/graph';
import Graph                      from '../../components/Graph';
import falcor                     from '../../falcor/model';
import mapPropsStream             from '../../falcor/mapPropsStream';
import connectFalcor              from '../../falcor/connect';
import {
  withGraphLayoutStream,
}                                 from '../../hoc/withGraphLayout';
import {
  getSheets,
  getSheetPathSets,
}                                 from '../../redux/modules/sheets';
import withContainerDimensions    from '../../hoc/withContainerDimensions';

export default compose(
  setDisplayName('GraphContainer'),
  // connect(
  //   (state, { sheetId: rootSheetId, }) => {
  //     const sheetPaths = Object.keys(getSheets(state))
  //       .filter((sheetId) => sheetId === rootSheetId || sheetId.split(',')[0] === rootSheetId)
  //       .reduce((accumSheetPaths, sheetId) =>
  //         [...accumSheetPaths, ...getSheetPathSets(state, sheetId)],
  //       []);

  //     return {
  //       paths: sheetPaths.length > 0 ? sheetPaths : null,
  //     };
  //   }
  // ),
  // mapPropsStream(connectFalcor(prop('paths'))),
  // withProps(({ sheetPaths, }) => {
  //   const falcorJSON = falcor.getCache(...sheetPaths);

  //   return {
  //     graph: jsonGraphCollection2JGF(
  //       path(['collection', 'schema:Person'], falcorJSON.jsonGraph),
  //       falcorJSON.jsonGraph
  //     ),
  //   };
  // }),
  withContainerDimensions,
  withHandlers({
    onNodeMouseEnter: () => (id) => {
      console.log('enter', id);
    },
    onNodeMouseLeave: () => (id) => {
      console.log('leave', id);
    },
  }),
  mapPropsStream(withGraphLayoutStream)
)(Graph);
