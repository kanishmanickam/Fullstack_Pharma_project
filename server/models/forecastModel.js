import mongoose from 'mongoose';

const forecastParametersSchema = new mongoose.Schema({
    forecastHorizon: {
        type: Number,
        required: true,
        default: 4,
        min: 1,
        max: 12
    },
    leadTimeDays: {
        type: Number,
        required: true,
        default: 7,
        min: 1,
        max: 60
    },
    safetyStockPercent: {
        type: Number,
        required: true,
        default: 20,
        min: 0,
        max: 100
    },
    seasonalMultipliers: {
        type: Map,
        of: Number,
        default: {
            jan: 1.0, feb: 1.0, mar: 1.1, apr: 1.2,
            may: 1.2, jun: 1.1, jul: 1.3, aug: 1.3,
            sep: 1.2, oct: 1.4, nov: 1.4, dec: 1.2
        }
    }
}, { timestamps: true });

export const ForecastParameters = mongoose.model('ForecastParameters', forecastParametersSchema);
