import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
// import { Tensor2D, Tensor, models, tensor2d, Rank, div, sub, min, max, tensor, split, 
//     Sequential, sequential, layers, train, metrics, oneHot } from '@tensorflow/tfjs-node';
import { LocationDetail, TimelineDetail, Timelines, CovidLocation, LatestSum } from '../models';
import { Observable } from 'rxjs';

const VARIABLE_CATEGORY_COUNT = {
    confirmed: 10,
    deaths: 10,
    recovered: 10
};

@Injectable({
    providedIn: 'root'
})
export class TrainerService {

    confirmedDataset: any;
    deathsDataset: any;
    recoveredDataset: any;

    trainingLogs = {
        lossContainer: null,
        accContainer: null,
    };

    constructor() { }

    normalize(tensor: tf.Tensor<tf.Rank.R2>): tf.Tensor<tf.Rank> {
        return tf.div(
            tf.sub(tensor, tf.min(tensor)),
            tf.sub(tf.max(tensor), tf.min(tensor))
        );
    }

    createDatasets(data: CovidLocation[], features: any, categoricalFeatures: Set<string>, testSize: number): tf.Tensor<tf.Rank>[] {
        const x = data.map(r =>
            features.flatMap(f => {
                if (categoricalFeatures.has(f)) {
                    return this.oneHot(!r.latest[f] ? 0 : r.latest[f], VARIABLE_CATEGORY_COUNT[f]);
                }
                return !r.latest[f] ? 0 : r.latest[f];
            })
        );

        const xT = this.normalize(tf.tensor2d(x));

        let totalInfected = 0;
        data.forEach(d => {
            for (const p in d) {
                totalInfected += this.coerceNumberProperty(d[p]);
            }
        });

        const y = tf.tensor(data.map(r => this._totalLatest(r.latest)));

        const splitIdx = parseInt(((1 - testSize) * data.length as any), 10);

        const [xTrain, xTest] = tf.split(xT, [splitIdx, data.length - splitIdx]);
        const [yTrain, yTest] = tf.split(y, [splitIdx, data.length - splitIdx]);

        return [xTrain, xTest, yTrain, yTest];
    }

    trainLinearModel(xTrain: tf.Tensor, yTrain: tf.Tensor): Observable<tf.Sequential> {
        return new Observable(ob => {
            const model = tf.sequential();

            model.add(
                tf.layers.dense({
                    inputShape: [xTrain.shape[1]],
                    units: xTrain.shape[1],
                    activation: 'sigmoid'
                })
            );

            model.add(tf.layers.dense({ units: 1 }));

            model.compile({
                optimizer: tf.train.sgd(0.001),
                loss: 'meanSquaredError',
                metrics: [tf.metrics.meanSquaredError]
            });

            model.fit(xTrain, yTrain, {
                batchSize: 32,
                epochs: 100,
                shuffle: true,
                validationSplit: 0.1,
                
            }).then(result => {
                ob.next(model);
                ob.complete();
            });
        });
    }

    private _totalLatest(latest: LatestSum): number {
        let total = 0;

        if (typeof latest !== 'object' || latest === null) return total;

        for (const p in latest) {
            total += this.coerceNumberProperty(latest[p]);
        }
        return total;
    }

    private oneHot(val, count): number[] {
        return Array.from(tf.oneHot(val, count).dataSync());
    }

    private coerceNumberProperty(value: any, fallbackValue = 0) {
        return this._isNumberValue(value) ? Number(value) : fallbackValue;
    }

    private _isNumberValue(value: any): boolean {
        // parseFloat(value) handles most of the cases we're interested in (it treats null, empty string,
        // and other non-number values as NaN, where Number just uses 0) but it considers the string
        // '123hello' to be a valid number. Therefore we also check if Number(value) is NaN.
        return !isNaN(parseFloat(value as any)) && !isNaN(Number(value));
    }

}
