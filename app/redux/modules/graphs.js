/* eslint-disable arrow-body-style */
import {
  nthArg,
  pathOr,
  path,
  map,
  xprod,
  contains,
  mergeDeepWithKey,
  mergeWith,
  pipe,
  concat,
  uniq,
  reduce,
  values,
  reject,
  equals,
}                                    from 'ramda';
import createCachedSelector          from 're-reselect';
import {
  path2Key,
}                                    from './sheets';
import {
  arraySingleDepthEqualitySelector,
}                                    from '../../utils/selectors';
import {
  REMOVE_TABLE,
  getTable,
}                                    from './tables';
import { expandIndicesKeySet } from '../../utils/sheet';


/**
 * utils
 */


/**
 * selectors
 */
export const getGraph = (state, graphId) => state.graphs[graphId];
export const getGraphTableIds = (state, graphId) => state.graphs[graphId].tables;

/**
 * @param {Object} state
 * @param {String} tableId
 */
export const getSearchCollectionPath = createCachedSelector(
  getTable,
  ({ search, }) => ['collection', `schema:${search}`]
)(
  nthArg(1),
);


/**
 * @param {Object} state
 * @param {String} tableId
 */
export const getPathsThroughGraph = createCachedSelector(
  getTable,
  ({ indices, predicates, }) => (
    xprod(expandIndicesKeySet(indices), predicates)
      .map(([index, predicate]) => ([
        index, predicate, 0, 'skos:prefLabel',
      ]))
  )
)(
  nthArg(1),
);

const makeNode = (id, metadata) => ({ id, metadata, });
const makeEdge = (source, target, metadata) => ({ source, target, metadata, });
// TODO - get graph from cache and follow pathSets to create JGF
// reduce over paths, producing subject + predicate + object [literal/relationship]
export const getJGFMapFromPath = (
  [collectionIndex, predicate, predicateIndex, ...restPath],
  graphJSON,
  jgfMap
) => {
  if (
    graphJSON[collectionIndex].value === null ||
    graphJSON[collectionIndex].$type === 'error'
  ) {
    return jgfMap;
  }

  const nodeId = path2Key(graphJSON[collectionIndex].$__path);
  // TODO - merge, rather than overwrite, if nodeId already exists
  jgfMap.nodes[nodeId] = makeNode(
    nodeId,
    { absolutePath: graphJSON[collectionIndex].$__path, }
  );


  const predicateValue = predicate === 'skos:prefLabel' ?
    path([collectionIndex, predicate], graphJSON) :
    path([collectionIndex, predicate, predicateIndex], graphJSON);

  if (!predicateValue) {
    return jgfMap;
  } else if (
    predicateValue.$type === 'atom' &&
    jgfMap.nodes[nodeId].metadata[predicate]
  ) {
    jgfMap.nodes[nodeId].metadata[predicate].push(predicateValue.value);
    return jgfMap;
  } else if (predicateValue.$type === 'atom') {
    jgfMap.nodes[nodeId].metadata[predicate] = [predicateValue.value];
    return jgfMap;
  }

  // TODO - mark bidirectional edges, rather than adding two edges
  const targetId = path2Key(predicateValue.$__path);
  jgfMap.edges[`${nodeId}||${targetId}`] = makeEdge(nodeId, targetId, { predicateURI: predicate, });

  return getJGFMapFromPath(
    [predicateIndex, ...restPath],
    pathOr({}, [collectionIndex, predicate], graphJSON),
    jgfMap
  );
};


/**
 * @param {Object} state
 * @param {String} tableId
 * @param {Object} graphJSON
 */
export const getTableJGFMap = createCachedSelector(
  nthArg(2),
  getSearchCollectionPath,
  getPathsThroughGraph,
  (graphJSON, searchCollectionPath, paths) => {
    // console.log('getTableJGFMap');
    return paths
      .reduce((jgfMap, path) => (
        getJGFMapFromPath(path, pathOr({}, searchCollectionPath, graphJSON), jgfMap)
      ), { nodes: {}, edges: {}, });
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

    return tableIds.map((tableId) => getTableJGFMap(state, tableId, graphJSON));
  },
  (tableGraphs) => {
    // console.log('getGraphJGF');

    // merge nodes and edges for graphs from different tables
    return pipe(
      reduce((jgfMap, { nodes, edges, }) => {
        return {
          nodes: mergeDeepWithKey(
            (key, left, right) => (
              key === 'metadata' ?
                mergeWith(pipe(concat, uniq), left, right) :
                right
            ),
            jgfMap.nodes,
            nodes
          ),
          edges: mergeDeepWithKey(
            (key, left, right) => (
              key === 'metadata' ?
                mergeWith(pipe(concat, uniq), left, right) :
                right
            ),
            jgfMap.edges,
            edges
          ),
        };
      }, { nodes: {}, edges: {}, }),
      // TODO - perhaps graph could take jgfMap, rather than jgf
      ({ nodes, edges, }) => ({ nodes: values(nodes), edges: values(edges), }),
    )(tableGraphs);
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
      tables: ['0-0-0'],
    },
  },
  action
) => {
  if (action.type === REMOVE_TABLE) {
    // TODO - remove nested tables
    return map((graph) => ({
      ...graph,
      tables: contains(action.tableId, graph.tables) ?
        reject(equals(action.tableId), graph.tables) :
        graph.tables,
    }), state);
  }

  return state;
};
