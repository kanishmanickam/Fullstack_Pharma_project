import * as tf from '@tensorflow/tfjs';

/**
 * Normalizes an array of numbers to [0, 1] range
 */
const normalize = (data) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    if (min === max) return { normalized: data.map(() => 0.5), min, max };
    const normalized = data.map(val => (val - min) / (max - min));
    return { normalized, min, max };
};

/**
 * Denormalizes a value from [0, 1] range
 */
const denormalize = (val, min, max) => {
    return val * (max - min) + min;
};

/**
 * Prepares sequences (windowing) for LSTM
 * windowSize: number of previous days to look at
 */
const createSequences = (data, windowSize) => {
    const X = [];
    const y = [];
    for (let i = 0; i <= data.length - windowSize - 1; i++) {
        X.push(data.slice(i, i + windowSize));
        y.push(data[i + windowSize]);
    }
    return { X, y };
};

/**
 * LSTM Forecast implementation
 * @param {number[]} data - Historical sales quantity array
 * @param {number} horizon - Number of days to forecast
 * @param {number} windowSize - Input window (default 7 days)
 */
export const lstmForecast = async (data, horizon, windowSize = 7) => {
    if (data.length < windowSize + 1) {
        // Fallback if data is too sparse for LSTM
        console.log('Insufficient data for LSTM, using simple moving average fallback');
        const avg = data.reduce((a, b) => a + b, 0) / (data.length || 1);
        return Array(horizon).fill(avg);
    }

    const { normalized, min, max } = normalize(data);
    const { X, y } = createSequences(normalized, windowSize);

    // Convert to tensors
    const tensorX = tf.tensor2d(X).reshape([X.length, windowSize, 1]);
    const tensorY = tf.tensor2d(y, [y.length, 1]);

    // Define model
    const model = tf.sequential();
    model.add(tf.layers.lstm({
        units: 20,
        inputShape: [windowSize, 1],
        returnSequences: false
    }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
    });

    // Train model (few epochs for quick Node.js execution)
    await model.fit(tensorX, tensorY, {
        epochs: 50,
        verbose: 0
    });

    // Forecast
    const predictions = [];
    let lastWindow = normalized.slice(-windowSize);

    for (let i = 0; i < horizon; i++) {
        const input = tf.tensor2d(lastWindow, [1, windowSize]).reshape([1, windowSize, 1]);
        const predTensor = model.predict(input);
        const predVal = (await predTensor.data())[0];

        predictions.push(Math.max(0, denormalize(predVal, min, max)));

        // Update window for next step
        lastWindow.shift();
        lastWindow.push(predVal);

        // Cleanup tensors
        input.dispose();
        predTensor.dispose();
    }

    // Cleanup model tensors
    tensorX.dispose();
    tensorY.dispose();
    model.dispose();

    return predictions;
};
