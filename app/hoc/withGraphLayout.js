/* eslint-disable no-param-reassign, no-shadow, no-underscore-dangle */
import {
  switchMap,
}                                    from 'rxjs/operators';
import {
  Observable,
}                                    from 'rxjs/Observable';
import * as d3                       from 'd3';

// * graph stream: input - jgf (or keyed version), output - stream emitting d3-ready data
//   * on output: cache node x/y and velocity
//   * on input: for nodes that don't have specified x/y, add x/y from cache (always add velocity)

// enhancements
// * take apart d3 force simulation so that it builds/applies the x/z/v cache in the same pass that it mutates the input
//   * requires 1 passes over data, rather than 3
//   * but in cases where the output is being stored (e.g. in a redux store), there is no need to make more than one pass,
//     which suggests I should decouple the cache merge on input
//     even though my case (graph is derived from separate data structure) requires some cache merge, this is not a general usecase
//   * or in the very least, make the cache merge configurable via param
// * make input data structure keyed, for easy diffing
// * maintain geo index for fast lookups by location (R-tree or K-d tree)
// * maintain graph index for fast edge lookups (adjacency matrix or adjacnecy list)
// * for large graphs, push layout to webworker
// * diff incoming width/height/nodes/edges and only apply simulation update to the ones that change
// * cache should be LRU cache to prevent memory leak (cache stores position for all nodes, including those that are removed from the graph)
//   * alternatively, cache should remove positions of removed nodes


export const withGraphLayout = () => {
  const nodePositions = {};
  let _nodes;
  let _edges;

  const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d) => d.id))
    .force('charge', d3.forceManyBody())
    .alphaDecay(0.03) // default 0.0228
    .alphaMin(0.002); // default 0.001

  const mapNodeToCachePositions = (node) => {
    if (
      nodePositions[node.id] &&
      nodePositions[node.id].x &&
      nodePositions[node.id].y &&
      nodePositions[node.id].vx &&
      nodePositions[node.id].vy &&
      !node.x &&
      !node.y &&
      !node.vx &&
      !node.vy
    ) {
      node.x = nodePositions[node.id].x;
      node.y = nodePositions[node.id].y;
      node.vx = nodePositions[node.id].vx;
      node.vy = nodePositions[node.id].vy;
    }

    return node;
  };

  const onDrag = (id, x, y) => {
    const node = _nodes.find((node) => node.id === id);
    node.fx = x;
    node.fy = y;
    simulation.alpha(0.5).restart();
  };

  const onDragEnd = (id) => {
    const node = _nodes.find((node) => node.id === id);
    node.fx = null;
    node.fy = null;
  };

  return ({ graph: { nodes, edges, }, width, height, ...props }, cb) => {
    _nodes = nodes;
    _edges = edges;

    simulation
      .force('center', d3.forceCenter(width / 2, height / 2));

    simulation
      .nodes(_nodes.map(mapNodeToCachePositions));

    simulation
      .force('link')
      .links(_edges);

    simulation.alpha(0.5).restart();

    simulation
      .on('tick', () => {
        _nodes.forEach(({ id, x, y, vx, vy, }) => { nodePositions[id] = { x, y, vx, vy, }; });
        cb({ ...props, graph: { nodes, edges, }, width, height, onDrag, onDragEnd, });
      });
  };
};

export const withGraphLayoutStream = (props$) => {
  const graphLayout = withGraphLayout();

  return props$
    .pipe(
      switchMap((props) => (
        Observable.create((observer) => (
          graphLayout(props, observer.next.bind(observer))
        ))
      ))
    );
};
