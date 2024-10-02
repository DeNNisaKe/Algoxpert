import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Constants } from 'src/shared/utils/constants.utils';
import { Algorithm } from '../models/algorithm.model';
import * as tf from '@tensorflow/tfjs-node';
import { MongoUtils } from 'src/shared/utils/mongo.utils';
import { AlgorithmGateway } from '../gateways/algorithm.gateway';
import { EventLogService } from 'src/event-log/services/event-log.service';
import { RandomForestRegression } from 'ml-random-forest';

@Injectable()
export class AlgorithmService {
  constructor(
    @InjectModel(Algorithm.name, Constants.MONGO_CONNECTION_NAME)
    protected readonly algorithmModel: Model<Algorithm>,
    private readonly algorithmGateway: AlgorithmGateway,
    private readonly eventLogService: EventLogService,
  ) {}

  async create(body: any) {
    try {
      return this.algorithmModel.create(body);
    } catch (error) {
      console.log(error);
    }
  }

  async findAll() {
    try {
      return this.algorithmModel.find().exec();
    } catch (error) {
      console.log(error);
    }
  }

  private getOptimizer(algorithmName: string, learningRate: number) {
    if (algorithmName === 'adam') {
      return tf.train.adam(learningRate);
    } else if (algorithmName === 'sgd') {
      return tf.train.sgd(learningRate);
    } else {
      throw new Error(`Unsupported optimizer: ${algorithmName}`);
    }
  }

  async run(
    algorithmName: string,
    algorithmId: string,
    trainingDataValue: number,
    validationDataValue: number,
    batchSize?: number,
    maximumEpochs?: number,
  ) {
    const algorithm = await this.algorithmModel
      .findById(MongoUtils.ObjectId(algorithmId.toString()))
      .exec();

    if (!algorithm) {
      return;
    }

    // Extract the data from the algorithm object
    let xsData = [];
    let ysData = [];
    for (let cls of algorithm.classes) {
      for (let specimen of cls.specimens) {
        for (let data of specimen.specificData) {
          xsData.push(data.realTimeClock);
          ysData.push(data.resistanceGasSensor);
        }
      }
    }

    // If the algorithm is Random Forest, use ml-random-forest-regression
    if (algorithmName === 'random-forest') {
      // Normalize the data
      const xsDataNormalized = xsData.map((x) => x / Math.max(...xsData));
      const ysDataNormalized = ysData.map((y) => y / Math.max(...ysData));

      // Split the data into training and validation datasets
      const splitIndex = Math.floor(xsDataNormalized.length * 0.8);
      const trainingData = xsDataNormalized
        .slice(0, splitIndex)
        .map((x) => [x]);
      const trainingLabels = ysDataNormalized.slice(0, splitIndex);
      const validationData = xsDataNormalized.slice(splitIndex).map((x) => [x]);
      const validationLabels = ysDataNormalized.slice(splitIndex);

      // Create and train the Random Forest model
      const options = {
        seed: 3,
        maxFeatures: 0.8,
        replacement: true,
        nEstimators: 50, // Increase the number of estimators
      };
      const regressor = new RandomForestRegression(options);
      regressor.train(trainingData, trainingLabels);

      // Use the model to do inference on a data point the model hasn't seen
      const outputValue = regressor.predict([[5 / Math.max(...xsData)]]);

      // Calculate mean squared error on the validation data
      let sumSquaredError = 0;
      for (let i = 0; i < validationData.length; i++) {
        const prediction = regressor.predict([validationData[i]])[0];
        const error = prediction - validationLabels[i];
        sumSquaredError += error * error;
      }

      // we use MSE instead of accuracy for regression models
      const meanSquaredError = sumSquaredError / validationData.length;

      const eventLog = {
        algorithmId,
        algorithm,
        mse: meanSquaredError,
        trainingRounds: options.nEstimators,
        trainingAlgorithm: algorithmName,
      };

      await this.eventLogService.createEventLog(eventLog);

      return { outputValue, meanSquaredError };
    }

    // Define a model for classification.
    const model = tf.sequential();

    model.add(
      tf.layers.dense({
        units: 512,
        activation: 'relu',
        inputShape: [1],
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }), // Decrease the regularization strength
      }),
    );

    model.add(
      tf.layers.dense({
        units: 256, // Increase the number of units
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
      }),
    );

    // Adding dropout layer
    model.add(tf.layers.dropout({ rate: 0.7 })); // Increase the dropout rate

    model.add(
      tf.layers.dense({
        units: 3,
        activation: 'softmax',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }), // Decrease the regularization strength
      }),
    );

    const optimizer = this.getOptimizer(algorithmName, 0.001);

    // Prepare the model for training: Specify the loss and the optimizer.
    model.compile({
      loss: 'categoricalCrossentropy', // Cross_Entropy = - Σ (y log(p)), y is the actual value (0 or 1 in case of one-hot encoded labels). p is the predicted probability of the class.
      optimizer: optimizer,
      metrics: ['accuracy'],
    });

    // Convert the data to tensors
    let xs = tf.tensor2d(xsData, [xsData.length, 1]);
    let ys = tf.tensor2d(ysData, [ysData.length, 1]);

    // Normalize the data
    const xsMean = xs.mean();
    const xsStd = tf.moments(xs).variance.sqrt();
    xs = xs.sub(xsMean).div(xsStd);

    const ysMean = ys.mean();
    const ysStd = tf.moments(ys).variance.sqrt();
    ys = ys.sub(ysMean).div(ysStd);

    // Flatten the arrays
    const xsArray = xs.arraySync().flat();
    let ysArray = ys.arraySync().flat();

    const ysOneHot = tf.oneHot(ysArray, 3);

    // Create the elements array
    let elements = xsArray.map((x, i) => ({
      xs: tf.tensor([[x]]),
      ys: ysOneHot.slice([i, 0], [1, -1]).flatten(),
    }));

    // Sort the elements by timestamp
    elements.sort((a, b) => a.xs.arraySync()[0][0] - b.xs.arraySync()[0][0]);

    // Create the dataset
    let dataset = tf.data.array(elements);

    // Shuffle the data
    const bufferSize = xsData.length; // The buffer size should be large enough to hold all our data for perfect shuffling.
    dataset = dataset.shuffle(bufferSize);

    // Calculate the number of data points for training and validation
    const trainingSize = Math.floor(xsData.length * (trainingDataValue / 100));
    const validationSize = Math.floor(
      xsData.length * (validationDataValue / 100),
    );

    // Split the data into training and validation sets
    const trainingData = dataset.take(trainingSize);
    const validationData = dataset.skip(trainingSize).take(validationSize);

    // Separate the inputs and targets and batch the data
    const trainingDataBatches = trainingData
      .map(({ xs, ys }) => ({ xs, ys }))
      .batch(batchSize);

    const validationDataBatches = validationData
      .map(({ xs, ys }) => ({ xs, ys }))
      .batch(batchSize);

    let bestValLoss = Number.POSITIVE_INFINITY;
    let bestWeights;

    const customCallback = {
      onEpochEnd: async (epoch, logs) => {
        this.sendProgress(epoch, maximumEpochs);
        if (logs.val_loss < bestValLoss) {
          bestValLoss = logs.val_loss;
          bestWeights = model.getWeights();
        }
      },
    };

    console.log('Training the model...');
    console.log(trainingDataBatches, validationDataBatches);

    let ysTensor = tf.tensor(ysArray);
    if (ysTensor.rank === 1) {
      ysArray = ysTensor.arraySync() as number[];
    } else {
      console.error('ysTensor is not one-dimensional');
    }

    // Calculate class weights
    const classWeights = this.calculateClassWeights(ysArray); // Calculate the class weights

    // Train the model using the training data and validate on the validation data
    await model.fitDataset(trainingDataBatches, {
      epochs: maximumEpochs,
      validationData: validationDataBatches,
      callbacks: [customCallback],
      classWeight: classWeights,
    });

    // After training, restore the best weights
    model.setWeights(bestWeights);

    // Generating config file and saving the model
    // // Generate a random number
    // const randomNumber = Math.floor(Math.random() * 10000);

    // await model.save(
    //   `file://D:/AN4/licenta/api-app/src/algorithms/models/model${randomNumber}`,
    // );

    // // Generate a .aiconfig file
    // const aiConfig = {
    //   aiConfigHeader: {
    //     algorithmName: algorithmName,
    //     dateCreated_ISO: new Date().toISOString(),
    //     appVersion: '1.0.0',
    //   },
    //   aiConfigBody: {
    //     type: 'classification',
    //     classes: [
    //     ],
    //     heaterProfile: {
    //     },
    //     dutyCycleProfile: {
    //     },
    //     trainingSettings: {
    //       method: 'ADAM',
    //       batchSize: batchSize,
    //       maxTrainingEpochs: maximumEpochs,
    //       learningRate: 0.001,
    //       dataSplittingMethod: 'random',
    //       trainingDataSplitting: 0.7,
    //       lossFunction: 'CrossEntropy',
    //       dataChannels: [
    //         'gas_resistance',
    //       ],
    //       dataClipping: false,
    //       dataAugmentation: {
    //         activated: false,
    //       },
    //     },
    //     trainingResults: {
    //       bsecVersion: '2.5.0.2',
    //       bsecConfig: '',
    //     },
    //   },
    // };

    // // Save the configuration to a file
    // const fs = require('fs');
    // fs.writeFileSync(
    //   'path/to/your/directory/model.aiconfig',
    //   JSON.stringify(aiConfig, null, 2),
    // );

    // Use the model to do inference on a data point the model hasn't seen.
    const output = model.predict(tf.tensor2d([5], [1, 1])) as tf.Tensor;

    // Printing the value
    output.print();

    // Value as a number
    const outputValue = output.dataSync()[0];

    // Calculate accuracy on the validation data
    const validationDataArray = await validationData.toArray();
    const predictions = model.predict(
      tf
        .stack(validationDataArray.map((item) => item.xs))
        .reshape([validationDataArray.length, 1]),
    ) as tf.Tensor;
    const predictionValues = tf.argMax(predictions, 1).dataSync();
    const trueValues = tf
      .argMax(tf.stack(validationDataArray.map((item) => item.ys)), 1)
      .dataSync();

    let correctPredictions = 0;
    for (let i = 0; i < predictionValues.length; i++) {
      if (predictionValues[i] === trueValues[i]) {
        correctPredictions++;
      }
    }

    console.log('Correct predictions:', correctPredictions);
    console.log('Total predictions:', predictionValues.length);

    const accuracy = correctPredictions / predictionValues.length;

    const eventLog = {
      algorithmId,
      algorithm,
      accuracy,
      loss: bestValLoss,
      totalPredictions: predictionValues.length,
      correctPredictions,
      batches: batchSize,
      trainingRounds: maximumEpochs,
      trainingAlgorithm:
        algorithmName.charAt(0).toUpperCase() + algorithmName.slice(1),
    };

    await this.eventLogService.createEventLog(eventLog);

    console.log('Accuracy:', accuracy);

    return { outputValue, accuracy };
  }

  private calculateClassWeights(labels) {
    // Initialize classCounts with 0 for each class
    let classCounts = { 0: 0, 1: 0, 2: 0 };

    // Count the number of examples in each class
    for (let label of labels) {
      classCounts[label]++;
    }

    // Calculate the total number of examples
    let total = labels.length;

    // Calculate the weight for each class
    let classWeights = {};
    for (let label in classCounts) {
      classWeights[label] = total / (classCounts[label] || 1);
    }

    return classWeights;
  }

  private sendProgress(currentEpoch, totalEpochs) {
    // Send progress update
    if (currentEpoch <= totalEpochs) {
      setTimeout(() => {
        this.algorithmGateway.sendProgress({
          epoch: currentEpoch,
          totalEpochs: totalEpochs,
        });
      }, 1000); // Delay in milliseconds
    }
  }
}
