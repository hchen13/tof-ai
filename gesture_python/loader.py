import tensorflow as tf
import pathlib
import random

from tensorflow.python.keras.preprocessing.image import ImageDataGenerator

from settings import DATA_ROOT


def load(data_dir, preprocess_func, split=0., batch_size=64, width=224, shuffle=True):
    tdg = ImageDataGenerator(
        preprocessing_function=preprocess_func,
        horizontal_flip=True,
        rotation_range=10,
        zoom_range=.1,
        validation_split=split
    )
    vdg = ImageDataGenerator(
        preprocessing_function=preprocess_func,
        validation_split=split
    )
    train_gen = tdg.flow_from_directory(
        data_dir,
        batch_size=batch_size,
        target_size=(width, width),
        shuffle=shuffle,
        subset='training'
    )
    valid_gen = vdg.flow_from_directory(
        data_dir,
        batch_size=batch_size,
        target_size=(width, width),
        shuffle=shuffle,
        subset='validation'
    )
    return train_gen, valid_gen

if __name__ == '__main__':
    train, valid = load(DATA_ROOT, tf.keras.applications.mobilenet_v2.preprocess_input, split=.1, shuffle=False)
