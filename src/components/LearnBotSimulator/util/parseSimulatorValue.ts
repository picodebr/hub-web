import { learnBotConstants } from '../constantes';
import {
  ILearnBotDCMotor,
  ILearnBotServoMotor,
  ILearnBotUltrasonicSensor,
  LearnBotErrorNumbers,
  learnBotErrorNumbers,
  LearnBotLedRgb,
  LearnBotPosition,
  LearnBotSimulationMode,
  learnBotSimulationModes,
  LearnBotSimulationStatus,
  learnBotSimulationStatuses,
} from '../interfaces';

import { parseNumber } from './parseNumber';

const { SERVO_PIN_A, SERVO_PIN_B, ULTRASONIC_PIN_A, ULTRASONIC_PIN_B, NO_PIN, DEFAULT_INPUT_VALUE } = learnBotConstants;

export const parseSimulationStatus = (value: unknown, current: LearnBotSimulationStatus) => {
  const nextStatus = `${value}`.toLocaleLowerCase().trim();

  return learnBotSimulationStatuses.includes(nextStatus as any) ? (nextStatus as LearnBotSimulationStatus) : current;
};

export const parseSimulationMode = (value: unknown, current: LearnBotSimulationMode) => {
  const mode = `${value}`.toLocaleUpperCase().trim();

  return learnBotSimulationModes.includes(mode as any) ? (mode as LearnBotSimulationMode) : current;
};

export const parseSimulationError = (value: unknown, current: LearnBotErrorNumbers) =>
  parseNumber(value, {
    allow: learnBotErrorNumbers,
    default: current,
  }) as LearnBotErrorNumbers;

export const parseDigitalValue = (value: unknown, current: number) =>
  parseNumber(value, {
    allow: [0, 1],
    default: current,
  });

export const parseAnalogValue = (value: unknown, current: number) =>
  parseNumber(value, {
    min: 0,
    max: 1,
    default: current,
  });

export const parseLedRgb = (value: any, current: LearnBotLedRgb) => [
  parseAnalogValue(value?.[0], current[0]),
  parseAnalogValue(value?.[1], current[1]),
  parseAnalogValue(value?.[2], current[2]),
];

export const parseUltrasonicSensor = (value: any, current: ILearnBotUltrasonicSensor, allowPositionUpdate: boolean): ILearnBotUltrasonicSensor => {
  const trigger = parseNumber(value?.trigger_pin, {
    allow: [NO_PIN, ULTRASONIC_PIN_A, ULTRASONIC_PIN_B],
    default: current.trigger_pin,
  });

  const echo = parseNumber(value?.echo_pin, {
    allow: [NO_PIN, ULTRASONIC_PIN_A, ULTRASONIC_PIN_B],
    default: current.echo_pin,
  });

  let { position } = current;

  if (allowPositionUpdate) position = parsePosition(value?.position, current.position);

  const conflict = trigger === echo;

  const newTriggerPin = conflict ? current.trigger_pin : trigger;
  const newEchoPin = conflict ? current.echo_pin : echo;
  const newValue = conflict ? current.value : parseAnalogValue(value?.value, current.value);

  const allowNewValue = (position || !allowPositionUpdate) && newTriggerPin !== NO_PIN && newEchoPin !== NO_PIN;

  return {
    value: allowNewValue ? newValue : DEFAULT_INPUT_VALUE,
    trigger_pin: position || !allowPositionUpdate ? newTriggerPin : NO_PIN,
    echo_pin: position || !allowPositionUpdate ? newEchoPin : NO_PIN,
    position,
  };
};

export const parseServoMotor = (
  value: any,
  current: ILearnBotServoMotor,
  other: ILearnBotServoMotor,
  allowPositionUpdate: boolean,
): ILearnBotServoMotor => {
  const signal_pin = parseNumber(value?.signal_pin, {
    allow: [NO_PIN, SERVO_PIN_A, SERVO_PIN_B],
    default: current.signal_pin,
  });

  let { position } = current;

  if (allowPositionUpdate) position = parsePosition(value?.position, current.position);

  const conflict = signal_pin === other.signal_pin && signal_pin !== NO_PIN;

  const newSignalPin = conflict ? current.signal_pin : signal_pin;

  return {
    value: current.value,
    signal_pin: position || !allowPositionUpdate ? newSignalPin : NO_PIN,
    position,
  };
};

export const parseDcMotor = (
  value: any,
  current: ILearnBotDCMotor,
  allowedPins: [number, number],
  allowPositionUpdate: boolean,
): ILearnBotDCMotor => {
  const positive_pin = parseNumber(value?.positive_pin, {
    allow: [NO_PIN, ...allowedPins],
    default: current.positive_pin,
  });

  const negative_pin = parseNumber(value?.negative_pin, {
    allow: [NO_PIN, ...allowedPins],
    default: current.negative_pin,
  });

  let { position } = current;

  if (allowPositionUpdate) position = parsePosition(value?.position, current.position);

  const conflict = positive_pin === negative_pin && positive_pin !== NO_PIN;

  const newPositivePin = conflict ? current.positive_pin : positive_pin;
  const newNegativePin = conflict ? current.negative_pin : negative_pin;

  return {
    speed: current.speed,
    direction: current.direction,
    positive_pin: position || !allowPositionUpdate ? newPositivePin : NO_PIN,
    negative_pin: position || !allowPositionUpdate ? newNegativePin : NO_PIN,
    position,
  };
};

type parsePositionType = (position: unknown, _default?: LearnBotPosition) => LearnBotPosition;

export const parsePosition: parsePositionType = (position: unknown, _default?: LearnBotPosition) => {
  if (position === null) return null;

  const defaultValue = _default || null;

  if (!position || !Array.isArray(position) || position.length !== 2) return defaultValue;

  const [x, y] = position;

  if (typeof x !== 'number' || Number.isNaN(x)) return defaultValue;
  if (typeof y !== 'number' || Number.isNaN(y)) return defaultValue;

  return [x, y];
};
