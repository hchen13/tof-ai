import os
import shutil

import numpy as np
from sklearn.metrics import classification_report
from tensorflow.python.keras.callbacks import TensorBoard

import settings
from gesturenet import GestureNet
from loader import load
import tensorflow as tf

if __name__ == '__main__':
    print("[info] loading data from directory...")
    train_gen, valid_gen = load(
        settings.DATA_ROOT,
        width=settings.IMAGE_WIDTH,
        batch_size=settings.BATCH_SIZE,
        preprocess_func=tf.keras.applications.mobilenet.preprocess_input,
        split=.2,
        shuffle=True
    )
    _x, _y = valid_gen[0]

    print('\n[info] creating GestureNet model...')
    engine = GestureNet(train_gen.num_classes, dense_layers=settings.MODEL_CONFIG['dense_layers'], input_shape=_x.shape[1:])
    engine.base_model.trainable = False
    opt = tf.keras.optimizers.Adam(learning_rate=settings.TRAINING['alpha'], beta_1=.99, decay=.001/settings.TRAINING['epochs'])
    engine.model.compile(loss='categorical_crossentropy', optimizer=opt, metrics=['acc'])

    print("\n[info] checking initial state:")
    loss0, acc0 = engine.model.evaluate(valid_gen)
    print("\tinitial loss: {:.3f}\n\tinitial accuracy: {:.2f}%".format(loss0, acc0 * 100))

    experiment_name = 'exp1'
    log_dir = os.path.join('./logs', experiment_name)
    if os.path.exists(log_dir):
        print("\n[note] experiment `{}` logs already exist, overwrite!".format(experiment_name))
        shutil.rmtree(log_dir)

    print("\n[info] setting up tensorboard monitoring,\n"
          "check status by starting tensorboard local server with:\n"
          "tensorboard --logdir={}".format('./logs'))
    monitor = TensorBoard(
        log_dir=log_dir,
        write_graph=False,
        histogram_freq=0
    )

    print('\n[info] start training...')
    H = engine.model.fit(train_gen, validation_data=valid_gen, epochs=settings.TRAINING['epochs'], callbacks=[monitor])

    predictions = engine.model.predict(_x)
    report = classification_report(_y.argmax(axis=1), predictions.argmax(axis=1), target_names=valid_gen.class_indices.keys())
    print(report)

    accuracy = np.mean(_y.argmax(axis=1) == predictions.argmax(axis=1))

    # exit if the accuracy is too low
    if accuracy < .53:
        exit()
    print('\n[info] training complete, saving model...')

    if not os.path.exists('./exports/keras_model'):
        os.makedirs('./exports/keras_model')

    # also save a copy of tf 2.0 saved_model format
    if tf.__version__ >= '2.0.0-beta1':
        engine.model.save('./exports/saved_model/gesturenet/1', save_format='tf')

    engine.model.save('./exports/keras_model/gesturenet.h5', save_format='h5')
