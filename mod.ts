import type { Component, ValidState } from "./component.ts";

export function not(a: ValidState): ValidState {
  return (~a & 1) as ValidState;
}

export function and(a: ValidState, b: ValidState): ValidState {
  return a && b;
}

export function nand(a: ValidState, b: ValidState): ValidState {
  return not(and(a, b));
}

export function or(a: ValidState, b: ValidState): ValidState {
  return a || b;
}

export function nor(a: ValidState, b: ValidState): ValidState {
  return not(or(a, b));
}

export function xor(a: ValidState, b: ValidState): ValidState {
  return (a ^ b) as ValidState;
}

export function xnor(a: ValidState, b: ValidState): ValidState {
  return not(xor(a, b));
}

export function createDFFComponent(
  name: string,
  clk: string,
  dIn: string
): Array<Component> {
  return [
    {
      id: `${name}.not_d_in`,
      type: "not",
      inputs: [dIn],
      state: 0,
    },
    {
      id: `${name}.d_nand_a`,
      type: "nand",
      inputs: [dIn, clk],
      state: 0,
    },
    {
      id: `${name}.q`,
      type: "nand",
      inputs: [`${name}.d_nand_a`, `${name}.q_`],
      state: 0,
    },
    {
      id: `${name}.d_nand_c`,
      type: "nand",
      inputs: [`${name}.not_d_in`, clk],
      state: 0,
    },
    {
      id: `${name}.q_`,
      type: "nand",
      inputs: [`${name}.d_nand_c`, `${name}.q`],
      state: 0,
    },
  ];
}

export function createDFFEComponent(
  name: string,
  clk: string,
  dIn: string,
  dEnable: string
): Array<Component> {
  const gatedClock: Component = {
    id: `${name}.clk`,
    type: "and",
    inputs: [clk, dEnable],
    state: 0,
  };

  return [gatedClock, ...createDFFComponent(name, gatedClock.id, dIn)];
}

export function createComponentLookup(
  components: Array<Component>
): Record<string, Component> {
  return components.reduce((output, item) => {
    output[item["id"]] = item;
    return output;
  }, {} as Record<string, Component>);
}

export function evaluate(
  components: Array<Component>,
  componentLookup: Record<string, Component>
) {
  function binaryOp(
    loginFn: (a: ValidState, b: ValidState) => ValidState,
    component: Component
  ) {
    const aOut = componentLookup[component.inputs[0]];
    const bOut = componentLookup[component.inputs[1]];

    component.state =
      aOut.state === "x" || bOut.state === "x"
        ? "x"
        : loginFn(aOut.state, bOut.state);
  }
  components.forEach((component) => {
    if (component.type === "custom") return;
    if (component.type === "and") return binaryOp(and, component);
    if (component.type === "nand") return binaryOp(nand, component);
    if (component.type === "or") return binaryOp(or, component);
    if (component.type === "nor") return binaryOp(nor, component);
    if (component.type === "xor") return binaryOp(xor, component);
    if (component.type === "xnor") return binaryOp(xnor, component);
    if (component.type === "not") {
      const aOut = componentLookup[component.inputs[0]];
      component.state = aOut.state === "x" ? "x" : not(aOut.state);
      return;
    }
  });
}

export { Trace } from "./trace.ts";
export * from "./component.ts";
