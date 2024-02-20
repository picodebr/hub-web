import { learnBotConstants } from '../constantes';
import {
  ILearnBotBoard,
  ILearnBotBuiltinComponents,
  ILearnBotBuiltinInputs,
  ILearnBotExternalComponents,
  ILearnBotExternalInputs,
  ILearnBotExternalOutputs,
  ILearnBotSimulation,
  ILearnBotSimulatorState,
} from '../interfaces';
import { formatComponents } from './formatComponents';
import {
  parseAnalogValue,
  parseDcMotor,
  parseDigitalValue,
  parsePosition,
  parseServoMotor,
  parseSimulationError,
  parseSimulationMode,
  parseSimulationStatus,
  parseUltrasonicSensor,
} from './parseSimulatorValue';

const { DC_MOTOR_0_PIN_A, DC_MOTOR_0_PIN_B, DC_MOTOR_1_PIN_A, DC_MOTOR_1_PIN_B } = learnBotConstants;

export const mergeSimulatorStates = (dst: ILearnBotSimulatorState, src: any) => {
  mergeSimulatorSimulation(dst.simulation, src?.simulation);

  mergeSimulatorBoard(dst.board, src?.board, dst.simulation.mode === '3D');
};

const mergeSimulatorBoard = (dst: ILearnBotBoard, src: Partial<ILearnBotBoard> | undefined, allowPositionUpdate: boolean) => {
  if (allowPositionUpdate) dst.position = parsePosition(src?.position) || dst.position;

  const components = formatComponents(src?.components, dst.components);

  mergeSimulatorBuiltinComponents(dst.components.builtin, components?.builtin);
  mergeSimulatorExternalComponents(dst.components.external, components?.external, allowPositionUpdate);
};

const mergeSimulatorSimulation = (dst: ILearnBotSimulation, src: Partial<ILearnBotSimulation> | undefined) => {
  dst.status = parseSimulationStatus(src?.status, dst.status);
  dst.loading = parseAnalogValue(src?.loading, dst.loading);
  dst.error = parseSimulationError(src?.error, dst.error);
  dst.mode = parseSimulationMode(src?.mode, dst.mode);
};

const mergeSimulatorBuiltinComponents = (dst: ILearnBotBuiltinComponents, src: Partial<ILearnBotBuiltinComponents> | undefined) => {
  mergeSimulatorBuiltinInputs(dst.inputs, src?.inputs);
};

const mergeSimulatorBuiltinInputs = (dst: ILearnBotBuiltinInputs, src: Partial<ILearnBotBuiltinInputs> | undefined) => {
  dst.temperature = parseAnalogValue(src?.temperature, dst.temperature);
  dst.ldr = parseAnalogValue(src?.ldr, dst.ldr);
  dst.button_0 = parseDigitalValue(src?.button_0, dst.button_0);
  dst.button_1 = parseDigitalValue(src?.button_1, dst.button_1);
  dst.button_2 = parseDigitalValue(src?.button_2, dst.button_2);
  dst.button_3 = parseDigitalValue(src?.button_3, dst.button_3);
  dst.button_4 = parseDigitalValue(src?.button_4, dst.button_4);
  dst.switch_led_rgb = parseDigitalValue(src?.switch_led_rgb, dst.switch_led_rgb);
  dst.switch_servo_motor = parseDigitalValue(src?.switch_servo_motor, dst.switch_servo_motor);
};

const mergeSimulatorExternalComponents = (
  dst: ILearnBotExternalComponents,
  src: Partial<ILearnBotExternalComponents> | undefined,
  allowPositionUpdate: boolean,
) => {
  mergeSimulatorExternalInputs(dst.inputs, src?.inputs, allowPositionUpdate);

  mergeSimulatorExternalOutputs(dst.outputs, src?.outputs, allowPositionUpdate);
};

const mergeSimulatorExternalInputs = (
  dst: ILearnBotExternalInputs,
  src: Partial<ILearnBotExternalInputs> | undefined,
  allowPositionUpdate: boolean,
) => {
  dst.ultrasonic = parseUltrasonicSensor(src?.ultrasonic, dst.ultrasonic, allowPositionUpdate);
};

const mergeSimulatorExternalOutputs = (
  dst: ILearnBotExternalOutputs,
  src: Partial<ILearnBotExternalOutputs> | undefined,
  allowPositionUpdate: boolean,
) => {
  dst.servo_motor_0 = parseServoMotor(src?.servo_motor_0, dst.servo_motor_0, dst.servo_motor_1, allowPositionUpdate);

  dst.servo_motor_1 = parseServoMotor(src?.servo_motor_1, dst.servo_motor_1, dst.servo_motor_0, allowPositionUpdate);

  dst.dc_motor_0 = parseDcMotor(src?.dc_motor_0, dst.dc_motor_0, [DC_MOTOR_0_PIN_A, DC_MOTOR_0_PIN_B], allowPositionUpdate);

  dst.dc_motor_1 = parseDcMotor(src?.dc_motor_1, dst.dc_motor_1, [DC_MOTOR_1_PIN_A, DC_MOTOR_1_PIN_B], allowPositionUpdate);
};
