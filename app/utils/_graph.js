import {
  pipe,
  toPairs,
  reduce,
  prop,
  uniqBy,
}                                    from 'ramda';
import {
  path2Key,
}                                    from '../redux/modules/sheets';


export const isGraphJSONCollectionNode = (index) => index !== '$__path' && index !== 'length';

export const isGraphJSONNode = (predicate) => (
  predicate !== '$__path' &&
  predicate !== 'skos:prefLabel' &&
  predicate !== 'uri'
);

export const createJGFNode = (id, metadata) => ({ id, metadata, });

export const createJGFEdge = (source, target, metadata) => ({ source, target, metadata, });

const addLiteral = (predicate, value, node) => {
  if (node.metadata[predicate]) {
    node.metadata[predicate].push(value);
  }

  node.metadata[predicate] = [value]; // eslint-disable-line no-param-reassign
};

const graphJSONResource2JGF = (resource, jgf) => {
  const node = createJGFNode(
    path2Key(resource.$__path),
    { absolutePath: resource.$__path, }
  );

  jgf.nodes.push(node);

  return pipe(
    toPairs,
    reduce((_jgf, [predicateURI, predicateCollection]) => {
      if (!isGraphJSONNode(predicateURI)) {
        return _jgf;
      }

      return pipe(
        toPairs,
        reduce((__jgf, [collectionIndex, collectionResource]) => {
          if (!isGraphJSONCollectionNode(collectionIndex)) {
            // filter out $__path, length
            return __jgf;
          } else if (collectionResource.$type === 'atom') {
            addLiteral(predicateURI, collectionResource.value, node);
            return __jgf;
          }

          __jgf.edges.push(createJGFEdge(node.id, path2Key(collectionResource.$__path), {}));

          return graphJSONResource2JGF(collectionResource, __jgf);
        }, _jgf)
      )(predicateCollection);
    }, jgf)
  )(resource);
};

export const graphJSONSearchCollection2JGF = (graphJSONSearchCollection) => {
  const { nodes, edges, } = pipe(
    toPairs,
    reduce((jgf, [collectionIndex, collectionResource]) => {
      if (
        !isGraphJSONCollectionNode(collectionIndex) || // filter out $__path, length
        collectionResource.$type === 'atom' // filter out empty search result nodes
      ) {
        return jgf;
      }

      return graphJSONResource2JGF(collectionResource, jgf);
    }, { nodes: [], edges: [], })
  )(graphJSONSearchCollection);

  return {
    nodes: uniqBy(prop('id'), nodes),
    edges: uniqBy(({ source, target, }) => `${source}::${target}`, edges),
  };
};
