export interface ILearnBotSimulatorState {
  simulation: ILearnBotSimulation;
  board: ILearnBotBoard;
}

export interface ILearnBotSimulation {
  type: LearnBotSimulationType;
  status: LearnBotSimulationStatus;
  loading: number;
  error: LearnBotErrorNumbers;
  mode: LearnBotSimulationMode;
}

export const learnBotSimulationModes = <const>['3D', 'AR'];
export type LearnBotSimulationMode = (typeof learnBotSimulationModes)[number];

export const learnBotErrorNumbers = <const>[0, 800, 801, 802, 803, 804, 805, 806, 807, 808];
export type LearnBotErrorNumbers = (typeof learnBotErrorNumbers)[number];

export const learnBotSimulationTypes = <const>['LearnBot v1.2'];
export type LearnBotSimulationType = (typeof learnBotSimulationTypes)[number];

export const learnBotSimulationStatuses = <const>['running', 'stopped'];
export type LearnBotSimulationStatus = (typeof learnBotSimulationStatuses)[number];

export type LearnBotPosition = [number, number] | null;

export interface ILearnBotElementLayout {
  element: string;
  position: LearnBotPosition;
  properties: Record<string, any>;
}

export interface ILearnBotBoard {
  position: LearnBotPosition;
  components: ILearnBotComponents;
}

export interface ILearnBotComponents {
  builtin: ILearnBotBuiltinComponents;
  external: ILearnBotExternalComponents;
}

export interface ILearnBotBuiltinComponents {
  inputs: ILearnBotBuiltinInputs;
  outputs: ILearnBotBuiltinOutputs;
}

export interface ILearnBotExternalComponents {
  inputs: ILearnBotExternalInputs;
  outputs: ILearnBotExternalOutputs;
}

export interface ILearnBotBuiltinInputs {
  temperature: number;
  ldr: number;
  button_0: number;
  button_1: number;
  button_2: number;
  button_3: number;
  button_4: number;
  switch_led_rgb: number;
  switch_servo_motor: number;
}

export interface ILearnBotBuiltinOutputs {
  buzzer: number;
  led_0: number;
  led_1: number;
  led_2: number;
  led_3: number;
  led_4: number;
  led_rgb: LearnBotLedRgb;
  led_power: number;
}

export type LearnBotLedRgb = [number, number, number];

export interface ILearnBotExternalInputs {
  ultrasonic: ILearnBotUltrasonicSensor;
}

export interface ILearnBotUltrasonicSensor {
  value: number;
  trigger_pin: number;
  echo_pin: number;
  position: LearnBotPosition;
}

export interface ILearnBotExternalOutputs {
  servo_motor_0: ILearnBotServoMotor;
  servo_motor_1: ILearnBotServoMotor;
  dc_motor_0: ILearnBotDCMotor;
  dc_motor_1: ILearnBotDCMotor;
}

export interface ILearnBotServoMotor {
  value: number;
  signal_pin: number;
  position: LearnBotPosition;
}

export interface ILearnBotDCMotor {
  speed: number;
  direction: number;
  positive_pin: number;
  negative_pin: number;
  position: LearnBotPosition;
}

export interface IWorkerPinMessage {
  pin: number;
  value: number;
}

const messageTypes = <const>['pin-change'];
type MessageType = (typeof messageTypes)[number];
export interface IWorkerMessage {
  type: MessageType;
  data: IWorkerPinMessage;
}

type PinHandler = (value: IWorkerPinMessage) => void;
type MessageHandler = PinHandler;
export type MessageHandlers = Record<MessageType, MessageHandler>;

export type LearnBotLayoutHandler = (layout: ILearnBotElementLayout) => void;
