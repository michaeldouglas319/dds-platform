export type NodeState = 'default' | 'dying' | 'deleting' | 'new' | 'cleaning';

export type NodeData = {
  alive: boolean;
  state: NodeState;
  timer: number;
  pulsePhase: number;
};



