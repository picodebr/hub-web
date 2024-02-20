import { arduinoConstants, learnBotConstants } from './constantes';

/*
   comment the export line for syntax highlight and TS features.
   Don't forget to comment the last line for better prettier formating.
*/

export const arduinoEnviroment = `
/* --------------------- CONSTANTS --------------------- */
// Logical states
const LOW = ${arduinoConstants.LOW};
const HIGH = ${arduinoConstants.HIGH};

// Arduino pins
const A0 = ${arduinoConstants.A0};
const A1 = ${arduinoConstants.A1};
const A2 = ${arduinoConstants.A2};
const A3 = ${arduinoConstants.A3};
const A4 = ${arduinoConstants.A4};
const A5 = ${arduinoConstants.A5};
const A6 = ${arduinoConstants.A6};
const A7 = ${arduinoConstants.A7};

// Pinout info
const NO_PIN = ${learnBotConstants.NO_PIN};

// Maximum values
const TOTAL_PINS = ${learnBotConstants.TOTAL_PINS};
const MAX_ANALOG_INPUT = ${learnBotConstants.MAX_ANALOG_INPUT};
const MAX_ANALOG_OUTPUT = ${learnBotConstants.MAX_ANALOG_OUTPUT};
const MAX_BUZZER_FREQUENCY = ${learnBotConstants.MAX_BUZZER_FREQUENCY};
const MAX_DELAY_MS = ${learnBotConstants.MAX_DELAY_MS};
const MAX_ULTRASONIC_DISTANCE_CM = ${learnBotConstants.MAX_ULTRASONIC_DISTANCE_CM};
const MIN_ULTRASONIC_DISTANCE_CM = ${learnBotConstants.MIN_ULTRASONIC_DISTANCE_CM};
const MAX_SERVO_ANGLE = ${learnBotConstants.MAX_SERVO_ANGLE};
const MIN_SERVO_ANGLE = ${learnBotConstants.MIN_SERVO_ANGLE};

// Outputs pinout
const BUZZER_PIN = ${learnBotConstants.BUZZER_PIN};
const DC_MOTOR_0_PIN = ${learnBotConstants.DC_MOTOR_0_PIN};
const DC_MOTOR_1_PIN = ${learnBotConstants.DC_MOTOR_1_PIN};
const LED_0_PIN = ${learnBotConstants.LED_0_PIN};
const LED_1_PIN = ${learnBotConstants.LED_1_PIN};
const LED_2_PIN = ${learnBotConstants.LED_2_PIN};
const LED_3_PIN = ${learnBotConstants.LED_3_PIN};
const LED_4_PIN = ${learnBotConstants.LED_4_PIN};

// Output possible pinout
const SERVO_PIN_A = ${learnBotConstants.SERVO_PIN_A};
const SERVO_PIN_B = ${learnBotConstants.SERVO_PIN_B};
const DC_MOTOR_0_PIN_A = ${learnBotConstants.DC_MOTOR_0_PIN_A};
const DC_MOTOR_0_PIN_B = ${learnBotConstants.DC_MOTOR_0_PIN_B};
const DC_MOTOR_1_PIN_A = ${learnBotConstants.DC_MOTOR_1_PIN_A};
const DC_MOTOR_1_PIN_B = ${learnBotConstants.DC_MOTOR_1_PIN_B};
const ULTRASONIC_PIN_A = ${learnBotConstants.ULTRASONIC_PIN_A};
const ULTRASONIC_PIN_B = ${learnBotConstants.ULTRASONIC_PIN_B};

// Inputs pinout
const LDR_PIN = ${learnBotConstants.LDR_PIN};
const TEMPERATURE_PIN = ${learnBotConstants.TEMPERATURE_PIN};
const BUTTON_0_PIN = ${learnBotConstants.BUTTON_0_PIN};
const BUTTON_1_PIN = ${learnBotConstants.BUTTON_1_PIN};
const BUTTON_2_PIN = ${learnBotConstants.BUTTON_2_PIN};
const BUTTON_3_PIN = ${learnBotConstants.BUTTON_3_PIN};
const BUTTON_4_PIN = ${learnBotConstants.BUTTON_4_PIN};
const BUTTONS_0_UP_TO_3_PIN = ${learnBotConstants.BUTTONS_0_UP_TO_3_PIN};

const pwmPins = [3, 5, 6, 9, 10, 11];
const analogPins = [A0, A1, A2, A3, A4, A5, A6, A7];

const externalInputs = {
  ultrasonic: {
    value: 0,
    trigger_pin: NO_PIN,
    echo_pin: NO_PIN,
  },
}

/* --------------------- AUXILIARY FUNCTIONS --------------------- */
const inRange = (val = 0, min = 0, max = 0) =>
  val < min ? min : val > max ? max : val;

const toInt = value => parseInt(value, 10);

const initPins = () => {
  const pins = [];

  for (let i = 0; i < TOTAL_PINS; i += 1)
    pins.push({
      value: 0,
      analog: analogPins.includes(i),
      pwm: pwmPins.includes(i),
    });

  return pins;
};

const pins = initPins();

const updatePinValue = (pin = -1, value = LOW) => {
  if (!pins[pin] || pins[pin].value === value) return;

  pins[pin].value = value;
  postMessage({ type: 'pin-change', data: { pin, value } });
};

addEventListener('message', e => {
  if (e.data?.type !== 'set-pin' || !pins[e.data.data?.pin]) return;

  pins[e.data.data.pin].value = e.data.data.value;
});

addEventListener('message', e => {
  if (e.data?.type !== 'set-input' || !e.data.data) return;

  Object.assign(externalInputs, e.data.data);
});

/* --------------------- ARDUINO FUNCTIONS --------------------- */
const digitalRead = (pin = -1) =>
  pins[pin]?.analog
    ? Math.round(pins[pin].value / MAX_ANALOG_INPUT)
    : pins[pin]?.value || LOW;

const digitalWrite = (pin = -1, value = LOW) => {
  if (!pins[pin]) return;

  const v = inRange(toInt(value), 0, 1);

  updatePinValue(pin, pins[pin].pwm ? v * MAX_ANALOG_OUTPUT : v);
};

const analogRead = (pin = -1) =>
  pins[pin]?.analog
    ? pins[pin].value
    : pins[pin]?.value === 1
    ? MAX_ANALOG_INPUT
    : 0;

const analogWrite = (pin = -1, value = LOW) => {
  if (!pins[pin]?.pwm) return;

  updatePinValue(pin, inRange(toInt(value), 0, MAX_ANALOG_OUTPUT));
};

const delay = (time = 0) =>
  new Promise(res => setTimeout(res, inRange(toInt(time), 0, MAX_DELAY_MS)));

const map = (value = 0, fromStart = 0, fromEnd = 0, toStart = 0, toEnd = 0) => {
  const fromDiff = Math.max(fromEnd - fromStart);
  const toDiff = Math.max(toEnd - toStart);
  const scale = toDiff / (fromDiff || 1);

  return (value - fromStart) * scale + toStart || 0;
};

let buzzerTimeoutDescriptor = 0;

/* --------------------- LEARNBOT FUNCTIONS --------------------- */
const ultrasonicUnits = ['cm', 'in'];

const ultrasonic = (unit = 'cm') => {
  const { value, trigger_pin, echo_pin } = externalInputs.ultrasonic;

  if (
    !ultrasonicUnits.includes(unit) ||
    trigger_pin === NO_PIN ||
    echo_pin === NO_PIN
  ) return -1;

  const cm = map(
    value,
    0,
    1,
    MIN_ULTRASONIC_DISTANCE_CM,
    MAX_ULTRASONIC_DISTANCE_CM
  );

  return unit === 'cm' ? cm : cm / 2.54;
}

const buzzer = (pin = -1, frequency = 0, duration = 0) => {
  if (!pins[pin]?.pwm || !frequency || !duration) return;

  clearTimeout(buzzerTimeoutDescriptor);

  const value = map(frequency, 0, MAX_BUZZER_FREQUENCY, 0, MAX_ANALOG_OUTPUT);

  updatePinValue(pin, value);

  buzzerTimeoutDescriptor = setTimeout(() => {
    updatePinValue(pin, 0);
  }, Math.max(duration, 0));
};

const servo = (pin = -1, angle = 0) => {
  if (!pins[pin]?.pwm) return;

  const analogValue = Math.round(
    map(
     inRange(angle, MIN_SERVO_ANGLE, MAX_SERVO_ANGLE),
     MIN_SERVO_ANGLE,
     MAX_SERVO_ANGLE,
     0,
     MAX_ANALOG_OUTPUT
   )
  );

  updatePinValue(pin, analogValue);
}

const safeLoop = () => delay(1); // prevent infinite loop trap

const main = async () => {
  if (typeof setup !== 'undefined') await setup();
  
  if (typeof loop !== 'undefined')
    while (true) {
      await loop();
      await safeLoop();
    }
}

setTimeout(main, 0);

/* --------------------- USER CODE --------------------- */
`; // comment this line for better prettier formatting
