/* eslint-disable react/no-multi-comp */
import React, {
  Component,
}                             from 'react';
import {
  string,
  number,
  shape,
  bool,
  func,
}                             from 'prop-types';
import                             './style.scss';


class Node extends Component {
  constructor(props) {
    super(props);

    this.isDragging = false;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.props.onDragStart(this.props.id, e);
  }

  onMouseUp(e) {
    this.isDragging = false;
    this.props.onDragEnd(this.props.id, e);
  }

  onMouseEnter() {
    if (!this.isDragging) {
      this.props.onMouseEnter(this.props.graphId, this.props.metadata.absolutePath);
    }
  }

  onMouseLeave() {
    if (!this.isDragging) {
      this.props.onMouseLeave(this.props.graphId, this.props.metadata.absolutePath);
    }
  }

  render() {
    const { id, x, y, teaserHint, activeHint, } = this.props;

    return (
      <circle
        data-id={id}
        r={teaserHint || activeHint ? 7 : 5}
        stroke="#aaa"
        strokeWidth={activeHint ? 2 : 1}
        fill="#85678F"
        cx={x}
        cy={y}
        style={{ cursor: 'pointer', }}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      />
    );
  }
}

Node.propTypes = {
  id: string.isRequired,
  graphId: string.isRequired,
  metadata: shape().isRequired,
  x: number.isRequired,
  y: number.isRequired,
  teaserHint: bool,
  activeHint: bool,
  onDragStart: func.isRequired,
  onDragEnd: func.isRequired,
  onMouseEnter: func.isRequired,
  onMouseLeave: func.isRequired,
};


class Graph extends Component {
  constructor(props) {
    super(props);

    this.draggedNode = null;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onMouseMove(e) {
    // NOTE - it's possible this should track mouseMove on the body rather than svg,
    // if we want it to pick up things like track outside of element and pan on mouse out
    if (this.draggedNode !== null) {
      this.props.onDrag(this.draggedNode, e.clientX - this.props.left, e.clientY - this.props.top);
    }
  }

  onDragStart(id) {
    this.draggedNode = id;
  }

  onDragEnd(id, e) {
    this.draggedNode = null;

    const { top, left, onDragEnd, } = this.props;
    onDragEnd(id, e.clientX - left, e.clientY - top);
  }

  render() {
    const {
      graphId, width, height, graph, onNodeMouseEnter, onNodeMouseLeave,
    } = this.props;

    return (
      <svg
        style={{ width, height, }}
        onMouseMove={this.onMouseMove}
      >
        <g className="edges">
          {graph.edges.map((edge) => (
            <line
              key={`${edge.source.id}::${edge.target.id}`}
              strokeWidth="1"
              stroke="#707880"
              x1={edge.source.x}
              y1={edge.source.y}
              x2={edge.target.x}
              y2={edge.target.y}
            />
          ))}
        </g>

        <g className="nodes">
          {graph.nodes.map((node) => (
            <Node
              key={node.id}
              id={node.id}
              graphId={graphId}
              metadata={node.metadata}
              x={node.x}
              y={node.y}
              teaserHint={node.teaserHint}
              activeHint={node.activeHint}
              onDragStart={this.onDragStart}
              onDragEnd={this.onDragEnd}
              onMouseEnter={onNodeMouseEnter}
              onMouseLeave={onNodeMouseLeave}
            />
          ))}
        </g>
      </svg>
    );
  }
}

Graph.propTypes = {
  graphId: string.isRequired,
  top: number.isRequired,
  left: number.isRequired,
  width: number.isRequired,
  height: number.isRequired,
  graph: shape().isRequired,
  onDrag: func.isRequired,
  onDragEnd: func.isRequired,
  onNodeMouseEnter: func.isRequired,
  onNodeMouseLeave: func.isRequired,
};


export default Graph;
