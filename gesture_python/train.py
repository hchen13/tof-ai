import os
import shutil

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
        preprocess_func=tf.keras.applications.mobilenet_v2.preprocess_input,
        split=.1,
        shuffle=True
    )
    _x, _y = valid_gen[0]

    print('\n[info] creating GestureNet model...')
    engine = GestureNet(train_gen.num_classes, [100], input_shape=_x.shape[1:])
    engine.base_model.trainable = False
    opt = tf.keras.optimizers.Adam(learning_rate=settings.TRAINING['alpha'])
    engine.model.compile(loss='categorical_crossentropy', optimizer=opt, metrics=['acc'])

    print("\n[info] checking initial state:")
    loss0, acc0 = engine.model.evaluate(valid_gen)
    print("\tinitial loss: {:.3f}\n\tinitial accuracy: {:.2f}%".format(loss0, acc0 * 100))

    experiment_name = 'exp1'
    log_dir = os.path.join('./.logs', experiment_name)
    if os.path.exists(log_dir):
        print("\n[note] experiment `{}` logs already exist, overwrite!".format(experiment_name))
        shutil.rmtree(log_dir)

    print("\n[info] setting up tensorboard monitoring,\ncheck status by starting tensorboard local server with:\n"
          "tensorboard --logdir=.logs")
    monitor = TensorBoard(
        log_dir=log_dir,
        write_graph=True,
        histogram_freq=1
    )

    print('\n[info] start training...')
    engine.model.fit(train_gen, validation_data=valid_gen, epochs=settings.TRAINING['epochs'], callbacks=[monitor])

    print('\n[info] training complete, saving model...')
    engine.model.save('./models/gesturenet/1', save_format='tf')
