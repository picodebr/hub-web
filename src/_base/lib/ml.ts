import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

let cachedModel: mobilenet.MobileNet | null = null;
let loadPromise: Promise<mobilenet.MobileNet> | null = null;

export async function getModel() {
  if (cachedModel) return cachedModel;
  if (!loadPromise) {
    loadPromise = (async () => {
      await tf.ready();
      return await mobilenet.load();
    })();
  }
  cachedModel = await loadPromise;
  return cachedModel;
}

export async function extractFeatures(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  isMirrored = false,
) {
  const model = await getModel();

  const canvasItem = document.createElement("canvas");
  canvasItem.width = 224;
  canvasItem.height = 224;
  const ctx = canvasItem.getContext("2d");

  if (!ctx) throw new Error("Could not get 2d context");

  if (isMirrored) {
    ctx.translate(224, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(imageElement, 0, 0, 224, 224);

  const thumbnail = canvasItem.toDataURL("image/jpeg", 0.8);

  const activation = tf.tidy(() => {
    const imgTensor = tf.browser.fromPixels(canvasItem);
    const pred = model.infer(imgTensor, true);
    return tf.keep(pred);
  });

  return { activation, thumbnail };
}

let trainedModel: tf.Sequential | null = null;

export function getTrainedModel() {
  return trainedModel;
}

export async function trainModel(
  classesData: { id: number; samples: { activation: tf.Tensor }[] }[],
  onProgress: (epoch: number, loss: number) => void,
) {
  const allFeatures: tf.Tensor[] = [];
  const allLabels: number[] = [];

  classesData.forEach((cls, classIndex) => {
    cls.samples.forEach((sample) => {
      const feature = sample.activation.reshape([1024]);
      allFeatures.push(feature);
      allLabels.push(classIndex);
    });
  });

  if (allFeatures.length === 0) throw new Error("No data");

  const xs = tf.stack(allFeatures);
  const ys = tf.oneHot(tf.tensor1d(allLabels, "int32"), classesData.length);

  trainedModel = tf.sequential();
  trainedModel.add(
    tf.layers.dense({ inputShape: [1024], units: 100, activation: "relu" }),
  );
  trainedModel.add(
    tf.layers.dense({ units: classesData.length, activation: "softmax" }),
  );

  trainedModel.compile({
    optimizer: tf.train.adam(0.001),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  await trainedModel.fit(xs, ys, {
    batchSize: 16,
    epochs: 50,
    shuffle: true,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        onProgress(epoch, logs?.loss || 0);
      },
    },
  });

  xs.dispose();
  ys.dispose();
}

export async function predictImage(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  isMirrored = false,
) {
  const model = await getModel();
  if (!trainedModel) throw new Error("Model not trained");

  return tf.tidy(() => {
    const canvasItem = document.createElement("canvas");
    canvasItem.width = 224;
    canvasItem.height = 224;
    const ctx = canvasItem.getContext("2d");

    if (!ctx) return [];
    if (isMirrored) {
      ctx.translate(224, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(imageElement, 0, 0, 224, 224);

    const imgTensor = tf.browser.fromPixels(canvasItem);
    const feature = model.infer(imgTensor, true).reshape([1, 1024]);

    const prediction = trainedModel!.predict(feature) as tf.Tensor;
    const scores = prediction.dataSync();

    return Array.from(scores);
  });
}
