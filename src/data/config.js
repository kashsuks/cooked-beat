export const CONFIG = {
    BPM: 120,
    SHIFT_DURATION: 100,
    MAX_ACTIVE_ORDERS: 3,
    SPAWN_INTERVAL_BEATS: 8,
    MAX_FAILED_ORDERS: 10,

    ACTION_KEYS: {
        chop: 'A',
        stir: 'S',
        flip: 'D',
        serve: ' '
    },

    KEY_LABELS: {
        chop: 'A',
        stir: 'S',
        flip: 'D',
        serve: 'SPACE',
    },

    TIMING_WINDOWS: {
        perfect: 0.1,
        good: 0.2
    },

    SCORING: {
        perfect: 50,
        good: 25,
        comboMultiplier: true
    }
};