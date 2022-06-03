import {
  Component,
  createComponentLookup,
  createDFFEComponent,
  evaluate,
  not,
  Trace,
} from "./mod.ts";

const EVALS_PER_STEP = 5;
const runFor = 25;
const trace = new Trace();

function create8BitMemoryComponent(
  name: string,
  clk: string,
  dEnable: string,
  dOutput: string,
  dIn: [string, string, string, string, string, string, string, string],
): Array<Component> {
  let components: Array<Component> = [];
  for (let i = 1; i < 9; i++) {
    components = components.concat(
      createDFFEComponent(`${name}.dffe${i}`, clk, dIn[i - 1], dEnable),
    );
    components.push({
      id: `${name}.dOut${i}`,
      type: "tristate",
      inputs: [`${name}.dffe${i}.q`, dOutput],
      state: "x",
    });
  }
  return components;
}

function create8BitDipSwitchComponent(name: string): Array<Component> {
  const components: Array<Component> = [];
  for (let i = 1; i < 9; i++) {
    components.push({
      id: `${name}.dOut${i}`,
      type: "custom",
      inputs: [],
      state: 0,
    });
  }
  return components;
}

function create8BitDataBusComponent(
  name: string,
  dIn: [
    Array<string>,
    Array<string>,
    Array<string>,
    Array<string>,
    Array<string>,
    Array<string>,
    Array<string>,
    Array<string>,
  ],
): Array<Component> {
  const components: Array<Component> = [];
  for (let i = 1; i < 9; i++) {
    components.push({
      id: `${name}.d${i}`,
      type: "bus",
      inputs: dIn[i - 1],
      state: "x",
    });
  }
  return components;
}

const components: Array<Component> = [
  {
    id: "clock",
    type: "custom",
    inputs: [],
    state: 0,
  },
  {
    id: "always_high",
    type: "custom",
    inputs: [],
    state: 1,
  },
  {
    id: "always_low",
    type: "custom",
    inputs: [],
    state: 0,
  },
  ...create8BitDipSwitchComponent("write_register_switch"),
  ...create8BitDipSwitchComponent("output_register_switch"),
  ...create8BitDipSwitchComponent("input_switch"),
  ...create8BitMemoryComponent(
    "r1",
    "clock",
    "write_register_switch.dOut1",
    "output_register_switch.dOut1",
    [
      "input_switch.dOut1",
      "input_switch.dOut2",
      "input_switch.dOut3",
      "input_switch.dOut4",
      "input_switch.dOut5",
      "input_switch.dOut6",
      "input_switch.dOut7",
      "input_switch.dOut8",
    ],
  ),
  ...create8BitMemoryComponent(
    "r2",
    "clock",
    "write_register_switch.dOut2",
    "output_register_switch.dOut2",
    [
      "input_switch.dOut1",
      "input_switch.dOut2",
      "input_switch.dOut3",
      "input_switch.dOut4",
      "input_switch.dOut5",
      "input_switch.dOut6",
      "input_switch.dOut7",
      "input_switch.dOut8",
    ],
  ),
  ...create8BitDataBusComponent("data_bus", [
    ["r1.dOut1", "r2.dOut1"],
    ["r1.dOut2", "r2.dOut2"],
    ["r1.dOut3", "r2.dOut3"],
    ["r1.dOut4", "r2.dOut4"],
    ["r1.dOut5", "r2.dOut5"],
    ["r1.dOut6", "r2.dOut6"],
    ["r1.dOut7", "r2.dOut7"],
    ["r1.dOut8", "r2.dOut8"],
  ]),
];
const componentLookup = createComponentLookup(components);

for (let iteration = 0; iteration < runFor; iteration++) {
  if (componentLookup.clock.state !== "x") {
    componentLookup.clock.state = not(componentLookup.clock.state);
  }

  if (iteration === 2) { // write 0xFF to r1
    componentLookup["input_switch.dOut1"].state = 1;
    componentLookup["input_switch.dOut2"].state = 1;
    componentLookup["input_switch.dOut3"].state = 1;
    componentLookup["input_switch.dOut4"].state = 1;
    componentLookup["input_switch.dOut5"].state = 1;
    componentLookup["input_switch.dOut6"].state = 1;
    componentLookup["input_switch.dOut7"].state = 1;
    componentLookup["input_switch.dOut8"].state = 1;
    componentLookup["write_register_switch.dOut1"].state = 1;
  } else if (iteration === 4) {
    componentLookup["write_register_switch.dOut1"].state = 0;
  }

  if (iteration % 2 === 0) {
    componentLookup["output_register_switch.dOut1"].state = 1;
    componentLookup["output_register_switch.dOut2"].state = 0;
  } else {
    componentLookup["output_register_switch.dOut1"].state = 0;
    componentLookup["output_register_switch.dOut2"].state = 1;
  }

  for (let i = 0; i < EVALS_PER_STEP; i++) {
    evaluate(components, componentLookup);
  }

  trace.sample(components);
}

// trace
//   .getAllTraces()
//   .forEach((trace) => console.log(trace));
trace
  .getTraces([
    "clock",
    "write_register_switch.dOut1",
    // "write_register_switch.dOut2",
    // "write_register_switch.dOut3",
    // "write_register_switch.dOut4",
    // "write_register_switch.dOut5",
    // "write_register_switch.dOut6",
    // "write_register_switch.dOut7",
    // "write_register_switch.dOut8",
    "input_switch.dOut1",
    // "input_switch.dOut2",
    // "input_switch.dOut3",
    // "input_switch.dOut4",
    // "input_switch.dOut5",
    // "input_switch.dOut6",
    // "input_switch.dOut7",
    // "input_switch.dOut8",
    "output_register_switch.dOut1",
    "output_register_switch.dOut2",
    // "output_register_switch.dOut3",
    // "output_register_switch.dOut4",
    // "output_register_switch.dOut5",
    // "output_register_switch.dOut6",
    // "output_register_switch.dOut7",
    // "output_register_switch.dOut8",
    "r1.dOut1",
    // "r1.dOut2",
    // "r1.dOut3",
    // "r1.dOut4",
    // "r1.dOut5",
    // "r1.dOut6",
    // "r1.dOut7",
    // "r1.dOut8",
    "r2.dOut1",
    // "r2.dOut2",
    // "r2.dOut3",
    // "r2.dOut4",
    // "r2.dOut5",
    // "r2.dOut6",
    // "r2.dOut7",
    // "r2.dOut8",
    "data_bus.d1",
    // "data_bus.d2",
    // "data_bus.d3",
    // "data_bus.d4",
    // "data_bus.d5",
    // "data_bus.d6",
    // "data_bus.d7",
    // "data_bus.d8",
  ])
  .forEach((trace) => console.log(trace));
