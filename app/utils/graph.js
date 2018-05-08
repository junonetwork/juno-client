/* eslint-disable no-use-before-define, no-restricted-syntax */
import { createElement } from 'react';
import R from 'ramda';
import {
  getFocus,
} from '../redux/modules/focus';
import {
  getGraphJGF,
  getGraphTeaserHint,
  graphWithHints,
} from '../redux/modules/graphs';
import Graph from '../containers/GraphContainer';


export const createGraphComponent = (state, graphId, graphFragment) => {
  const focus = getFocus(state);
  const graphJGF = getGraphJGF(state, graphId, graphFragment);
  const hints = getGraphTeaserHint(state, graphId);

  return {
    hints,
    component: (hints) => (
      createElement(Graph, {
        graphId,
        graph: graphWithHints(graphId, hints, graphJGF),
        focus,
      })
    ),
  };
};


export const createLiteral = (predicate, value, node) => {
  if (!node.metadata[predicate]) {
    node.metadata[predicate] = []; // eslint-disable-line no-param-reassign
  }

  node.metadata[predicate].push(value);

  return node;
};

export const createRelationship = (subjectId, targetPath, jsonGraph, jgf) => {
  const targetId = targetPath.join('/');

  // TODO - mutate
  let newJGF = {
    nodes: jgf.nodes,
    edges: [...jgf.edges, { source: subjectId, target: targetId }],
  };

  if (!newJGF.nodes.find((node) => node.id === targetId)) {
    newJGF = jsonGraphObject2JGF(targetPath, jsonGraph, newJGF);
  }

  return newJGF;
};


export const jsonGraphObject2JGF = (path, jsonGraph, jgf = { nodes: [], edges: [] }) => {
  const jsonGraphObject = R.path(path, jsonGraph);
  const subjectId = path.join('/');

  if (jgf.nodes.find((node) => node.id === subjectId)) {
    return jgf;
  }

  // keep a reference to newNode for createLiteral
  let newNode = {
    id: subjectId,
    metadata: {},
  };

  let newJGF = {
    nodes: [...jgf.nodes, newNode],
    edges: jgf.edges,
  };

  for (const predicate in jsonGraphObject) {
    if (jsonGraphObject[predicate].$type === 'atom') {
      // singleton literal [warning: mutates node]
      newNode = createLiteral(predicate, jsonGraphObject[predicate].value, newNode);
    } else if (jsonGraphObject[predicate].$type === 'ref') {
      // singleton relationship
      newJGF = createRelationship(
        subjectId, jsonGraphObject[predicate].value, jsonGraph, newJGF
      );
    } else {
      for (const idx in jsonGraphObject[predicate]) {
        if (idx === 'length') {
          continue; // eslint-disable-line no-continue
        } else if (jsonGraphObject[predicate][idx].$type === 'atom') {
          // multi literal [warning: mutates node]
          newNode = createLiteral(predicate, jsonGraphObject[predicate][idx].value, newNode);
        } else if (jsonGraphObject[predicate][idx].$type === 'ref') {
          // multi relationship
          newJGF = createRelationship(
            subjectId, jsonGraphObject[predicate][idx].value, jsonGraph, newJGF
          );
        }
      }
    }
  }

  return newJGF;
};


// TODO - b/c we have the paths, this could be done w/o introspection
export const jsonGraphCollection2JGF = (
  jsonGraphCollection,
  jsonGraph,
  jgf = { nodes: [], edges: [] }
) => {
  let newJGF = jgf;

  for (const idx in jsonGraphCollection) {
    if (jsonGraphCollection[idx].$type === 'ref') {
      newJGF = jsonGraphObject2JGF(jsonGraphCollection[idx].value, jsonGraph, newJGF);
    }
  }

  return newJGF;
};
