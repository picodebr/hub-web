import EventEmitter from 'events';
import * as Yup from 'yup';
import { arduinoEnviroment } from './arduinoEnvironment';
import { learnBotConstants } from './constantes';
import {
  ILearnBotDCMotor,
  ILearnBotElementLayout,
  ILearnBotServoMotor,
  ILearnBotSimulatorState,
  IWorkerMessage,
  IWorkerPinMessage,
  LearnBotLayoutHandler,
  MessageHandlers,
} from './interfaces';
import { createLearnBotInitialState } from './util/createLearnBotInitialState';
import { map } from './util/map';
import { mergeSimulatorStates } from './util/mergeSimulatorStates';
import { parsePosition, parseServoMotor, parseDcMotor, parseUltrasonicSensor } from './util/parseSimulatorValue';
import { workerExec } from './util/workerExec';

const {
  TOTAL_PINS,
  MAX_ANALOG_OUTPUT,
  MAX_TEMPERATURE_VOLTAGE_VM,
  MAX_ANALOG_VOLTAGE_MV,

  TEMPERATURE_PIN,
  BUTTON_0_ANALOG_VALUE,
  BUTTON_1_ANALOG_VALUE,
  BUTTON_2_ANALOG_VALUE,
  BUTTON_3_ANALOG_VALUE,
  BUTTON_4_PIN,
  BUTTONS_0_UP_TO_3_PIN,

  NO_PIN,

  MAX_LDR_ANALOG_VALUE,
  MIN_LDR_ANALOG_VALUE,
  LDR_PIN,

  DC_MOTOR_0_PIN,
  DC_MOTOR_1_PIN,
  LED_0_PIN,
  LED_1_PIN,
  LED_2_PIN,
  LED_3_PIN,
  LED_4_PIN,
  BUZZER_PIN,

  DC_MOTOR_0_PIN_A,
  DC_MOTOR_0_PIN_B,
  DC_MOTOR_1_PIN_A,
  DC_MOTOR_1_PIN_B,
} = learnBotConstants;

export class LearnBotSimulator extends EventEmitter {
  private state: ILearnBotSimulatorState;

  private _messageHandler: typeof this.messageHandler;

  private worker?: Worker;

  private pins: number[] = [];

  private messageHandlers: MessageHandlers = {
    'pin-change': this.pinHandler.bind(this),
  };

  constructor(initialLayouts?: ILearnBotElementLayout[]) {
    super();
    this.state = createLearnBotInitialState();
    this._messageHandler = this.messageHandler.bind(this);

    initialLayouts && this.setLayouts(initialLayouts);

    for (let i = 0; i < TOTAL_PINS; i += 1) this.pins.push(0);
  }

  public getState(): ILearnBotSimulatorState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public setState(state: any) {
    return this.checkStateAndUpdateOutputs(() => {
      mergeSimulatorStates(this.state, state);
    });
  }

  public start(code: string) {
    return this.checkStateAndUpdateOutputs(() => {
      this.stopTheWorkerAndRestartPins();
      this.state.simulation.status = 'running';
      this.worker = workerExec(arduinoEnviroment + code);
      this.worker.onmessage = this._messageHandler;
    });
  }

  public stop() {
    return this.checkStateAndUpdateOutputs(() => {
      this.stopTheWorkerAndRestartPins();
      this.state.simulation.status = 'stopped';
    });
  }

  public getElementsLayout() {
    return this.getLayouts();
  }

  private stopTheWorkerAndRestartPins() {
    process.env.NODE_ENV !== 'test' && this.worker?.terminate();
    this.worker = undefined;

    this.pins.forEach((_, i) => (this.pins[i] = 0));
  }

  private checkStateAndUpdateOutputs(callback: () => void) {
    const previousState = JSON.stringify(this.state);

    callback();

    this.updateSimulation();
    this.updateOutputs();
    this.updateInputPins();

    const currentState = JSON.stringify(this.state);

    if (previousState !== currentState) this.emit('statechange', JSON.parse(currentState));

    return this;
  }

  private messageHandler(e: MessageEvent<IWorkerMessage>) {
    const handler = this.messageHandlers[e.data.type];
    if (!handler) return;

    this.checkStateAndUpdateOutputs(() => handler(e.data.data));
  }

  private pinHandler(data: IWorkerPinMessage) {
    this.pins[data.pin] = data.value;
  }

  private updateSimulation() {
    if (this.state.simulation.status === 'running') return;

    this.stopTheWorkerAndRestartPins();
  }

  private updateOutputs() {
    this.updateBuiltinOutputs();
    this.updateExternalOutputs();
  }

  private updateBuiltinOutputs() {
    const { inputs, outputs } = this.state.board.components.builtin;
    const on = this.state.simulation.status === 'running';

    outputs.buzzer = on && !inputs.switch_servo_motor ? this.pins[BUZZER_PIN] / MAX_ANALOG_OUTPUT : 0;

    outputs.led_0 = on && !inputs.switch_led_rgb ? this.pins[LED_0_PIN] / MAX_ANALOG_OUTPUT : 0;

    outputs.led_1 = on && !inputs.switch_led_rgb ? this.pins[LED_1_PIN] / MAX_ANALOG_OUTPUT : 0;

    outputs.led_2 = on && !inputs.switch_led_rgb ? this.pins[LED_2_PIN] / MAX_ANALOG_OUTPUT : 0;

    outputs.led_3 = on ? (this.pins[LED_3_PIN] ? 1 : 0) : 0;
    outputs.led_4 = on ? (this.pins[LED_4_PIN] ? 1 : 0) : 0;

    outputs.led_rgb =
      on && inputs.switch_led_rgb
        ? [this.pins[LED_0_PIN] / MAX_ANALOG_OUTPUT, this.pins[LED_1_PIN] / MAX_ANALOG_OUTPUT, this.pins[LED_2_PIN] / MAX_ANALOG_OUTPUT]
        : [0, 0, 0];

    outputs.led_power = on ? (this.state.simulation.status === 'running' ? 1 : 0) : 0;
  }

  private updateExternalOutputs() {
    const { switch_servo_motor } = this.state.board.components.builtin.inputs;
    const { outputs } = this.state.board.components.external;

    this.updateServo(outputs.servo_motor_0, switch_servo_motor);
    this.updateServo(outputs.servo_motor_1, switch_servo_motor);
    this.updateDCMotor(outputs.dc_motor_0, DC_MOTOR_0_PIN);
    this.updateDCMotor(outputs.dc_motor_1, DC_MOTOR_1_PIN);
  }

  private updateServo(servo: ILearnBotServoMotor, switch_servo_motor: number) {
    const running = this.state.simulation.status === 'running';
    const on = servo.signal_pin !== NO_PIN && running;

    const enabled = servo.signal_pin !== 3 || switch_servo_motor;

    const value = on && enabled ? this.pins[servo.signal_pin] / MAX_ANALOG_OUTPUT : 0;
    if (Number.isNaN(value)) return;

    servo.value = value;
  }

  private updateDCMotor(motor: ILearnBotDCMotor, pin: number) {
    const running = this.state.simulation.status === 'running';
    const on = motor.negative_pin !== NO_PIN && motor.positive_pin !== NO_PIN && running;

    motor.speed = on ? this.pins[pin] / MAX_ANALOG_OUTPUT : 0;
    motor.direction = on ? (motor.negative_pin > motor.positive_pin ? 1 : 0) : 0;
  }

  private updateInputPins() {
    this.updateInputMergeButtons();
    this.updateInputIsolatedButton();
    this.updateTemperatureInput();
    this.updateLDRInput();
    this.updateUltrasonicInput();
  }

  private updateInputMergeButtons() {
    const { inputs } = this.state.board.components.builtin;

    const previousValue = this.pins[BUTTONS_0_UP_TO_3_PIN];

    if (inputs.button_0 === 1) this.pins[BUTTONS_0_UP_TO_3_PIN] = BUTTON_0_ANALOG_VALUE;
    else if (inputs.button_1 === 1) this.pins[BUTTONS_0_UP_TO_3_PIN] = BUTTON_1_ANALOG_VALUE;
    else if (inputs.button_2 === 1) this.pins[BUTTONS_0_UP_TO_3_PIN] = BUTTON_2_ANALOG_VALUE;
    else if (inputs.button_3 === 1) this.pins[BUTTONS_0_UP_TO_3_PIN] = BUTTON_3_ANALOG_VALUE;
    else this.pins[BUTTONS_0_UP_TO_3_PIN] = 0;

    if (this.pins[BUTTONS_0_UP_TO_3_PIN] === previousValue) return;

    this.worker?.postMessage({
      type: 'set-pin',
      data: {
        pin: BUTTONS_0_UP_TO_3_PIN,
        value: this.pins[BUTTONS_0_UP_TO_3_PIN],
      },
    });
  }

  private updateInputIsolatedButton() {
    const { inputs } = this.state.board.components.builtin;

    const previousValue = this.pins[BUTTON_4_PIN];

    this.pins[BUTTON_4_PIN] = inputs.button_4 >= 0.5 ? 1 : 0;

    if (this.pins[BUTTON_4_PIN] === previousValue) return;

    this.worker?.postMessage({
      type: 'set-pin',
      data: { pin: BUTTON_4_PIN, value: this.pins[BUTTON_4_PIN] },
    });
  }

  private updateTemperatureInput() {
    const { inputs } = this.state.board.components.builtin;

    const previousValue = this.pins[TEMPERATURE_PIN];

    const maxTempAnalogValue = Math.round((MAX_TEMPERATURE_VOLTAGE_VM / MAX_ANALOG_VOLTAGE_MV) * learnBotConstants.MAX_ANALOG_INPUT);

    this.pins[TEMPERATURE_PIN] = Math.round(inputs.temperature * maxTempAnalogValue);

    if (this.pins[TEMPERATURE_PIN] === previousValue) return;

    this.worker?.postMessage({
      type: 'set-pin',
      data: { pin: TEMPERATURE_PIN, value: this.pins[TEMPERATURE_PIN] },
    });
  }

  private updateLDRInput() {
    const { inputs } = this.state.board.components.builtin;

    const previousValue = this.pins[LDR_PIN];

    this.pins[LDR_PIN] = map(inputs.ldr, 0, 1, MIN_LDR_ANALOG_VALUE, MAX_LDR_ANALOG_VALUE);

    if (this.pins[LDR_PIN] === previousValue) return;

    this.worker?.postMessage({
      type: 'set-pin',
      data: { pin: LDR_PIN, value: this.pins[LDR_PIN] },
    });
  }

  private updateUltrasonicInput() {
    const { ultrasonic } = this.state.board.components.external.inputs;

    this.worker?.postMessage({
      type: 'set-input',
      data: { ultrasonic },
    });
  }

  private getLayouts(): ILearnBotElementLayout[] {
    const { board } = this.state;
    const { ultrasonic } = this.state.board.components.external.inputs;
    const { servo_motor_0, servo_motor_1, dc_motor_0, dc_motor_1 } = this.state.board.components.external.outputs;

    return [
      LearnBotSimulator.getElementLayout(board, 'board'),
      LearnBotSimulator.getElementLayout(ultrasonic, 'ultrasonic'),
      LearnBotSimulator.getElementLayout(servo_motor_0, 'servo_motor_0'),
      LearnBotSimulator.getElementLayout(servo_motor_1, 'servo_motor_1'),
      LearnBotSimulator.getElementLayout(dc_motor_0, 'dc_motor_0'),
      LearnBotSimulator.getElementLayout(dc_motor_1, 'dc_motor_1'),
    ];
  }

  private static getElementLayout(element: Record<string, any>, name: string): ILearnBotElementLayout {
    const properties = Object.keys(element)
      .filter((k) => k.endsWith('_pin'))
      .reduce((acc, key) => ({ ...acc, [key]: element[key] }), {});

    return {
      element: name,
      position: element.position || null,
      properties,
    };
  }

  private setLayouts(layouts: any) {
    if (!Array.isArray(layouts)) return;

    const layoutHandlers: Record<string, LearnBotLayoutHandler> = {
      board: this.updateBoardLayout.bind(this),
      ultrasonic: this.updateUltrasonicLayout.bind(this),
      servo_motor_0: this.updateServoLayout.bind(this),
      servo_motor_1: this.updateServoLayout.bind(this),
      dc_motor_0: this.updateDcMotorLayout.bind(this),
      dc_motor_1: this.updateDcMotorLayout.bind(this),
    };

    const layoutSchema = Yup.object().shape({
      element: Yup.string().required(),
      position: Yup.array(Yup.number()).length(2).nullable().required(),
      properties: Yup.object().required(),
    });

    layouts.forEach((layout) => {
      try {
        layoutSchema.validateSync(layout);
        const handler = layoutHandlers[layout.element];
        handler && handler(layout);
        // eslint-disable-next-line no-empty
      } catch {}
    });
  }

  private updateBoardLayout(layout: ILearnBotElementLayout) {
    const board = this.state.board;

    board.position = parsePosition(layout.position, board.position);
  }

  private updateUltrasonicLayout(layout: ILearnBotElementLayout) {
    const { inputs } = this.state.board.components.external;

    const newValues = parseUltrasonicSensor(
      { position: layout.position, ...layout.properties },
      inputs.ultrasonic,
      this.state.simulation.mode === '3D',
    );

    inputs.ultrasonic = newValues;
  }

  private updateServoLayout({ position, element, properties }: ILearnBotElementLayout) {
    const { outputs } = this.state.board.components.external;

    if (element !== 'servo_motor_0' && element !== 'servo_motor_1') return;

    const currentServo = outputs[element];
    const otherServo = outputs[element.endsWith('0') ? 'servo_motor_1' : 'servo_motor_0'];

    const newValues = parseServoMotor({ position, ...properties }, currentServo, otherServo, this.state.simulation.mode === '3D');

    outputs[element] = newValues;
  }

  private updateDcMotorLayout({ position, element, properties }: ILearnBotElementLayout) {
    const { outputs } = this.state.board.components.external;

    if (element !== 'dc_motor_0' && element !== 'dc_motor_1') return;

    const dcMotor = outputs[element];

    const allowedPins = element.endsWith('0') ? [DC_MOTOR_0_PIN_A, DC_MOTOR_0_PIN_B] : [DC_MOTOR_1_PIN_A, DC_MOTOR_1_PIN_B];

    const newValues = parseDcMotor({ position, ...properties }, dcMotor, allowedPins as [number, number], this.state.simulation.mode === '3D');

    outputs[element] = newValues;
  }
}
