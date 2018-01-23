/* eslint-disable arrow-body-style */
import {
  nthArg,
  pathOr,
}                                    from 'ramda';
import createCachedSelector          from 're-reselect';
import {
  path2Key,
}                                    from './sheets';
import {
  graphJSONSearchCollection2JGF,
}                                    from '../../utils/_graph';
import {
  objectSingleDepthEqualitySelector,
  arraySingleDepthEqualitySelector,
}                                    from '../../utils/selectors';


/**
 * utils
 */
// TODO
export const getSearchCollectionPath = (state, tableId) => ['collection', 'schema:Person'];

/**
 * selectors
 */
export const getGraph = (state, graphId) => state.graphs[graphId];
export const getGraphTableIds = (state, graphId) => state.graphs[graphId].tables;


/**
 * @param {Object} state
 * @param {String} graphId
 */
// TODO
export const getGraphPathSets = (state, graphId) => [];


export const getTableJGF = createCachedSelector(
  (state, tableId, graphJSON) => (
    pathOr({}, getSearchCollectionPath(state, tableId), graphJSON)
  ),
  (graphJSONSearchCollection) => {
    // console.log('getTableJGF');

    return graphJSONSearchCollection2JGF(graphJSONSearchCollection);
  }
)(
  nthArg(1),
);


/**
 * @param {Object} state
 * @param {String} graphId
 * @param {Object} JSONGraphEnvelope
 */
export const getGraphJGF = createCachedSelector(
  (state, graphId, { json: graphJSON, }) => {
    const tableIds = getGraphTableIds(state, graphId);

    if (!graphJSON || tableIds.length === 0) {
      return [];
    }

    return tableIds.map((tableId) => getTableJGF(state, tableId, graphJSON));
  },
  (tableGraphs) => {
    // console.log('getGraphJGF');

    return tableGraphs.reduce((jgf, { nodes, edges, }) => {
      jgf.nodes.push(...nodes);
      jgf.edges.push(...edges);

      return jgf;
    }, { nodes: [], edges: [], });
  }
)(
  nthArg(1),
  {
    selectorCreator: arraySingleDepthEqualitySelector,
  }
);


/**
 * reducer
 */
export default (
  state = {
    1: {
      tables: ['1-0-0'],
    },
  },
  action
) => state;
