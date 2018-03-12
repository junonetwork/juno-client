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
  omit,
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
import {
  expandIndicesKeySet,
}                                    from '../../utils/sheet';
import {
  getGraphTeaserDescriptor,
}                                    from './teaser';


/**
 * utils
 */
const makeNode = (id, metadata) => ({ id, metadata, });
const makeEdge = (source, target, metadata) => ({ source, target, metadata, });
const createGraph = () => ({ tables: [0], });


/**
 * selectors
 */
export const getGraph = (state, graphId) => state.graphs[graphId];
export const getGraphTableIds = (state, graphId) => state.graphs[graphId].tables;


export const getGraphTeaserHint = (state, graphId) => {
  const graphTeaserDescriptor = getGraphTeaserDescriptor(state);

  if (
    !graphTeaserDescriptor ||
    graphTeaserDescriptor.graphId !== graphId
  ) {
    return {};
  }

  return {
    teaserAbsolutePath: graphTeaserDescriptor.path,
  };
};


/**
 * @param {Object} state
 * @param {String} tableId
 */
// TODO - this is duplicate of cell2PathFragment
export const getSearchCollectionPath = createCachedSelector(
  getTable,
  ({ search, }) => ['collection', JSON.stringify(omit(['typeLabel'], search))]
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


/**
 * @param {Array} path
 * @param {Object} graphJSON
 * @param {Object} jgfMap
 */
export const getJGFMapFromPath = (
  [collectionIndex, predicate, predicateIndex, ...restPath],
  graphJSON,
  jgfMap
) => {
  if (
    !graphJSON[collectionIndex] ||
    graphJSON[collectionIndex].value === null ||
    graphJSON[collectionIndex].$type === 'error'
  ) {
    return jgfMap;
  }

  const nodeId = path2Key(graphJSON[collectionIndex].$__path);
  // TODO - merge, rather than overwrite, if nodeId already exists
  jgfMap.nodes[nodeId] = makeNode( // eslint-disable-line no-param-reassign
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
    jgfMap.nodes[nodeId].metadata[predicate] = [predicateValue.value]; // eslint-disable-line no-param-reassign
    return jgfMap;
  }

  // TODO - mark bidirectional edges, rather than adding two edges
  const targetId = path2Key(predicateValue.$__path);
  jgfMap.edges[`${nodeId}||${targetId}`] = makeEdge(nodeId, targetId, { predicateURI: predicate, }); // eslint-disable-line no-param-reassign

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
      .reduce((jgfMap, pathThroughGraph) => (
        getJGFMapFromPath(pathThroughGraph, pathOr({}, searchCollectionPath, graphJSON), jgfMap)
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
 * @param {String} graphId
 * @param {Array} teaserAbsolutePath
 * @param {Object} jgf
 */
export const withTeaserHint = createCachedSelector(
  nthArg(0),
  nthArg(1),
  nthArg(2),
  (graphId, teaserAbsolutePath, jgf) => {
    // console.log('withTeaserHint');
    return {
      nodes: jgf.nodes.map((node) => {
        if (equals(node.metadata.absolutePath, teaserAbsolutePath)) {
          // NOTE - d3 mutates jgf and requires that that reference be stable
          // immutably updating node breaks d3's layout algorithm
          node.teaserHint = true; // eslint-disable-line no-param-reassign
          return node;
        } else if (node.teaserHint === true) {
          node.teaserHint = undefined; // eslint-disable-line no-param-reassign
          return node;
        }

        return node;
      }),
      edges: jgf.edges,
    };
  }
)(
  nthArg(0)
);


/**
 * @param {String} graphId
 * @param {Array} activeAbsolutePath
 * @param {Object} jgf
 */
export const withActiveHint = createCachedSelector(
  nthArg(0),
  nthArg(1),
  nthArg(2),
  (graphId, activeAbsolutePath, jgf) => {
    // console.log('withActiveHint');
    return {
      nodes: jgf.nodes.map((node) => {
        if (equals(node.metadata.absolutePath, activeAbsolutePath)) {
          // NOTE - d3 mutates jgf and requires that that reference be stable
          // immutably updating node breaks d3's layout algorithm
          node.activeHint = true; // eslint-disable-line no-param-reassign
          return node;
        } else if (node.activeHint === true) {
          node.activeHint = undefined; // eslint-disable-line no-param-reassign
          return node;
        }

        return node;
      }),
      edges: jgf.edges,
    };
  }
)(
  nthArg(0)
);


/**
 * @param {String} graphId
 * @param {Object} hints
 * @param {Object} jgf
 */
export const graphWithHints = (
  graphId,
  { activeAbsolutePath, teaserAbsolutePath, },
  jgf
) => pipe(
  (_jgf) => withActiveHint(graphId, activeAbsolutePath, _jgf),
  (_jgf) => withTeaserHint(graphId, teaserAbsolutePath, _jgf)
)(jgf);


/**
 * constants
 */
export const ADD_GRAPH = 'ADD_GRAPH';
export const REMOVE_GRAPH = 'REMOVE_GRAPH';


/**
 * action creators
 */
export const addGraph = (graphId) => ({
  type: ADD_GRAPH, graphId,
});
export const removeGraph = (graphId) => ({
  type: REMOVE_GRAPH, graphId,
});


/**
 * reducer
 */
export default (
  state = {},
  action
) => {
  if (action.type === ADD_GRAPH) {
    return {
      ...state,
      [action.graphId]: createGraph(),
    };
  } else if (action.type === REMOVE_GRAPH) {
    return omit([action.graphId], state);
  } else if (action.type === REMOVE_TABLE) {
    // TODO - remove nested tables
    return map((graph) => ({
      ...graph,
      tables: contains(action.tableId, graph.tables) ?
        reject(equals(action.tableId), graph.tables) :
        graph.tables,
    }), state);
  }

  // TODO - add/remove/move tables
  // there is a lot of duplication between graphs and sheets.  the relationship bt/ tables graphs/sheets
  // could move to windows modules, standardizing on (windowId), rather than sheetId/graphId

  return state;
};
