import { learnBotConstants } from '../constantes';
import { ILearnBotSimulatorState } from '../interfaces';

const { NO_PIN } = learnBotConstants;

export const createLearnBotInitialState = (): ILearnBotSimulatorState => ({
  simulation: {
    type: 'LearnBot v1.2',
    status: 'stopped',
    loading: 0,
    error: 0,
    mode: '3D',
  },
  board: {
    position: [0, 0],
    components: {
      builtin: {
        inputs: {
          temperature: 0,
          ldr: 0,
          button_0: 0,
          button_1: 0,
          button_2: 0,
          button_3: 0,
          button_4: 0,
          switch_led_rgb: 0,
          switch_servo_motor: 0,
        },
        outputs: {
          buzzer: 0,
          led_0: 0,
          led_1: 0,
          led_2: 0,
          led_3: 0,
          led_4: 0,
          led_rgb: [0, 0, 0],
          led_power: 0,
        },
      },
      external: {
        inputs: {
          ultrasonic: {
            value: 0,
            trigger_pin: NO_PIN,
            echo_pin: NO_PIN,
            position: null,
          },
        },
        outputs: {
          servo_motor_0: {
            value: 0,
            signal_pin: NO_PIN,
            position: null,
          },
          servo_motor_1: {
            value: 0,
            signal_pin: NO_PIN,
            position: null,
          },
          dc_motor_0: {
            speed: 0,
            direction: 0,
            positive_pin: NO_PIN,
            negative_pin: NO_PIN,
            position: null,
          },
          dc_motor_1: {
            speed: 0,
            direction: 0,
            positive_pin: NO_PIN,
            negative_pin: NO_PIN,
            position: null,
          },
        },
      },
    },
  },
});
