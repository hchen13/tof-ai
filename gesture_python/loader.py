import matplotlib
matplotlib.use('TkAgg')
import tensorflow as tf
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


def display_image(images, titles, col=None, width=20):
    from matplotlib import pyplot as plt
    import numpy as np
    if col is None:
        col = len(images)
    row = np.math.ceil(len(images) / col)
    plt.figure(figsize=(width, (width + 1) * row / col))
    for i, image in enumerate(images):
        plt.subplot(row, col, i + 1)
        # plt.axis('off')
        plt.imshow(image, cmap='gray')
        plt.title(titles[i])
    plt.show()


if __name__ == '__main__':
    train, valid = load(DATA_ROOT, tf.keras.applications.mobilenet_v2.preprocess_input, split=.1, shuffle=True)
    x, y = valid[0]
    y = y.argmax(axis=1)
    labels = valid.class_indices
    d = []
    for name, idx in labels.items():
        d.append((idx, name))
    d = dict(d)

    for epoch in range(3):
        for i in range(len(train)):
            x, y = train[i]
            if i == 0:
                titles = [d[l] for l in y.argmax(axis=1)]
                display_image(x, titles, col=8, width=22)


    # display_image(x, titles, col=8, width=20)
