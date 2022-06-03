type ValidState = 0 | 1;

type State = ValidState | "x";

type Sample = Record<string, State>;

type BaseComponentType = "not" | "and" | "nand" | "or" | "nor" | "xor" | "xnor";

type ComponentType = BaseComponentType | "custom" | "tristate" | "bus";

interface Component {
  id: string;
  type: ComponentType;
  inputs: Array<string>;
  state: State;
}

export type {
  ValidState,
  State,
  Sample,
  BaseComponentType,
  ComponentType,
  Component,
};
