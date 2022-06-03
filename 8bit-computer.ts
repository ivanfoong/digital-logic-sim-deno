import {
  Component,
  createComponentLookup,
  createDFFEComponent,
  evaluate,
  not,
  Trace,
} from "./mod.ts";
import { readline } from "https://deno.land/x/readline_sync/mod.ts";
import { Cell, Table } from "https://deno.land/x/cliffy@v0.20.1/table/mod.ts";

const EVALS_PER_STEP = 5;
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

function printTrace() {
  // trace
  //   .getAllTraces()
  //   .forEach((trace) => console.log(trace));
  trace
    .getTraces([
      "clock",
      "write_register_switch.dOut1",
      "write_register_switch.dOut2",
      // "write_register_switch.dOut3",
      // "write_register_switch.dOut4",
      // "write_register_switch.dOut5",
      // "write_register_switch.dOut6",
      // "write_register_switch.dOut7",
      // "write_register_switch.dOut8",
      "input_switch.dOut1",
      "input_switch.dOut2",
      "input_switch.dOut3",
      "input_switch.dOut4",
      "input_switch.dOut5",
      "input_switch.dOut6",
      "input_switch.dOut7",
      "input_switch.dOut8",
      "output_register_switch.dOut1",
      "output_register_switch.dOut2",
      // "output_register_switch.dOut3",
      // "output_register_switch.dOut4",
      // "output_register_switch.dOut5",
      // "output_register_switch.dOut6",
      // "output_register_switch.dOut7",
      // "output_register_switch.dOut8",
      "r1.dffe1.q",
      "r1.dffe2.q",
      "r1.dffe3.q",
      "r1.dffe4.q",
      "r1.dffe5.q",
      "r1.dffe6.q",
      "r1.dffe7.q",
      "r1.dffe8.q",
      "r2.dffe1.q",
      "r2.dffe2.q",
      "r2.dffe3.q",
      "r2.dffe4.q",
      "r2.dffe5.q",
      "r2.dffe6.q",
      "r2.dffe7.q",
      "r2.dffe8.q",
      "data_bus.d1",
      "data_bus.d2",
      "data_bus.d3",
      "data_bus.d4",
      "data_bus.d5",
      "data_bus.d6",
      "data_bus.d7",
      "data_bus.d8",
    ])
    .forEach((trace) => console.log(trace));
}

function printStates(iteration: number) {
  const table = new Table();
  table.push([
    new Cell(`Step ${iteration}`).colSpan(2),
  ]);
  table.push(["clock", `${componentLookup["clock"].state}`]);
  function get8BitStates(id_prefix: string, id_suffix = ""): string {
    let bitString = "";
    for (let i = 8; i > 0; i--) {
      const id = `${id_prefix}${i}${id_suffix}`;
      bitString = `${bitString}${componentLookup[id].state}`;
    }
    return bitString;
  }

  table.push(["input_switch", get8BitStates("input_switch.dOut")]);
  table.push([
    "write_register_switch",
    get8BitStates("write_register_switch.dOut"),
  ]);
  table.push([
    "output_register_switch",
    get8BitStates("output_register_switch.dOut"),
  ]);
  table.push(["r1", get8BitStates("r1.dffe", ".q")]);
  table.push(["r2", get8BitStates("r2.dffe", ".q")]);
  table.push(["data_bus", get8BitStates("data_bus.d")]);
  table.border(true).render();
  console.log();
}

let iteration = 0;
let done = false;
while (!done) {
  const promptOptions = ["Step", "Trace", "Halt"];
  while (true) {
    const selectedOptionIndex = readline.chooseOption(promptOptions, "Action?");
    if (promptOptions[selectedOptionIndex] === "Halt") {
      done = true;
      break;
    } else if (promptOptions[selectedOptionIndex] === "Trace") {
      printTrace();
    } else if (promptOptions[selectedOptionIndex] === "Step") {
      break;
    }
  }

  if (componentLookup.clock.state !== "x") {
    componentLookup.clock.state = not(componentLookup.clock.state);
  }

  if (iteration === 2) {
    // write 0xFF to r1
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
  } else if (iteration === 6) {
    // copy r1 value to r2
    componentLookup["output_register_switch.dOut1"].state = 1;
    componentLookup["write_register_switch.dOut2"].state = 1;
  } else if (iteration === 8) {
    componentLookup["output_register_switch.dOut1"].state = 0;
    componentLookup["write_register_switch.dOut2"].state = 0;
  } else if (iteration === 10) {
    // show r2 value
    componentLookup["output_register_switch.dOut2"].state = 1;
  }

  for (let i = 0; i < EVALS_PER_STEP; i++) {
    evaluate(components, componentLookup);
  }

  trace.sample(components);
  
  printStates(iteration);

  iteration++;
}
