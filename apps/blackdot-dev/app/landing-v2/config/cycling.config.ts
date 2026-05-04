/**
 * Landing Page Cycling Configuration
 *
 * Controls smooth transitions for text and model cycling
 * All durations in seconds, intervals control cycle timing
 */

export type TransitionType = 'fade' | 'slide' | 'scale' | 'slideScale' | 'custom';

export interface TransitionConfig {
  /** Type of transition effect */
  type: TransitionType;

  /** Duration of transition in seconds */
  duration: number;

  /** Easing function (CSS timing function) */
  easing: string;

  /** Direction for slide transitions: 'left' | 'right' | 'up' | 'down' */
  direction?: 'left' | 'right' | 'up' | 'down';

  /** Optional rotation during transition (degrees) */
  rotation?: number;

  /** Optional scale range [from, to] */
  scaleRange?: [number, number];
}

export interface TextCyclingConfig {
  /** Enable text cycling */
  enabled: boolean;

  /** Time each text stays visible (seconds) */
  displayDuration: number;

  /** Transition configuration */
  transition: TransitionConfig;

  /** Delay before first cycle starts (seconds) */
  startDelay?: number;
}

export interface ModelCyclingConfig {
  /** Enable model cycling */
  enabled: boolean;

  /** Time each model stays visible (seconds) */
  displayDuration: number;

  /** Transition configuration */
  transition: TransitionConfig;

  /** Delay before first cycle starts (seconds) */
  startDelay?: number;
}

export interface CyclingConfig {
  /** Text cycling configuration */
  text: TextCyclingConfig;

  /** Model cycling configuration */
  model: ModelCyclingConfig;
}

// Predefined transition presets
export const TRANSITION_PRESETS: Record<string, TransitionConfig> = {
  fade: {
    type: 'fade',
    duration: 0.6,
    easing: 'ease-in-out',
  },
  slideLeft: {
    type: 'slide',
    duration: 0.8,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    direction: 'left',
  },
  slideRight: {
    type: 'slide',
    duration: 0.8,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    direction: 'right',
  },
  slideUp: {
    type: 'slide',
    duration: 0.8,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    direction: 'up',
  },
  slideDown: {
    type: 'slide',
    duration: 0.8,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    direction: 'down',
  },
  scale: {
    type: 'scale',
    duration: 0.7,
    easing: 'ease-in-out',
    scaleRange: [1, 0.8],
  },
  slideScale: {
    type: 'slideScale',
    duration: 0.9,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    direction: 'up',
    scaleRange: [1, 0.5],
  },
};

// Default cycling configurations
export const DEFAULT_CYCLING_CONFIG: CyclingConfig = {
  text: {
    enabled: true,
    displayDuration: 3,
    transition: TRANSITION_PRESETS.fade,
    startDelay: 0.5,
  },
  model: {
    enabled: true,
    displayDuration: 3,
    transition: TRANSITION_PRESETS.slideScale,
    startDelay: 0.5,
  },
};

// Preset cycling scenarios
export const CYCLING_PRESETS: Record<string, CyclingConfig> = {
  smooth: {
    text: {
      enabled: true,
      displayDuration: 3,
      transition: TRANSITION_PRESETS.fade,
      startDelay: 0,
    },
    model: {
      enabled: true,
      displayDuration: 3,
      transition: TRANSITION_PRESETS.fade,
      startDelay: 0.15,
    },
  },
  dynamic: {
    text: {
      enabled: true,
      displayDuration: 3.5,
      transition: TRANSITION_PRESETS.slideLeft,
      startDelay: 0,
    },
    model: {
      enabled: true,
      displayDuration: 3.5,
      transition: TRANSITION_PRESETS.slideScale,
      startDelay: 0.2,
    },
  },
  energetic: {
    text: {
      enabled: true,
      displayDuration: 2.5,
      transition: TRANSITION_PRESETS.slideUp,
      startDelay: 0,
    },
    model: {
      enabled: true,
      displayDuration: 2.5,
      transition: {
        type: 'slideScale',
        duration: 0.6,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        direction: 'down',
        scaleRange: [0.5, 1],
      },
      startDelay: 0.1,
    },
  },
  minimal: {
    text: {
      enabled: true,
      displayDuration: 4,
      transition: TRANSITION_PRESETS.fade,
      startDelay: 0.3,
    },
    model: {
      enabled: false,
      displayDuration: 4,
      transition: TRANSITION_PRESETS.fade,
      startDelay: 0,
    },
  },
};
