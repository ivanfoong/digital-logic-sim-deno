import {
  Trace,
  Component,
  createDFFEComponent,
  createComponentLookup,
  evaluate,
  not,
} from "./mod.ts";

const EVALS_PER_STEP = 5;
const runFor = 25;
const trace = new Trace();

const components: Array<Component> = [
  {
    id: "clock",
    type: "custom",
    inputs: [],
    state: 0,
  },
  {
    id: "A",
    type: "custom",
    inputs: [],
    state: 0,
  },
  {
    id: "E",
    type: "custom",
    inputs: [],
    state: 0,
  },
  ...createDFFEComponent("DFFE", "clock", "A", "E"),
];
const componentLookup = createComponentLookup(components);

for (let iteration = 0; iteration < runFor; iteration++) {
  if (componentLookup.clock.state !== "x") {
    componentLookup.clock.state = not(componentLookup.clock.state);
  }

  if (iteration === 0) {
    componentLookup.E.state = 1;
  }
  if (iteration === 1) {
    componentLookup.E.state = 0;
    componentLookup.A.state = 1;
  }
  if (iteration === 7) {
    componentLookup.E.state = 1;
  }
  if (iteration === 9) {
    componentLookup.E.state = 0;
    componentLookup.A.state = 0;
  }

  for (let i = 0; i < EVALS_PER_STEP; i++) {
    evaluate(components, componentLookup);
  }

  trace.sample(components);
}

trace
  .getTraces(["clock", "A", "E", "DFFE.q"])
  .forEach((trace) => console.log(trace));
