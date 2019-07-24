import matplotlib
matplotlib.use('TkAgg')
import cv2
import pathlib

import settings


def display_image(*images, col=None, width=20):
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
    plt.show()

if __name__ == '__main__':
    data_root = pathlib.Path(settings.DATA_ROOT)
    origin_image_root = data_root.joinpath('raw')
    dest_image_root = data_root.joinpath('gestures')
    origin_image_paths = list(origin_image_root.glob('*/*.*'))
    origin_image_paths = [str(path) for path in origin_image_paths]
    label_names = sorted(item.name for item in origin_image_root.glob('*/') if item.is_dir())
    origin_image_labels = [pathlib.Path(path).parent.name for path in origin_image_paths]

    for i, path in enumerate(origin_image_paths):
        if i % 10 == 0:
            print('.', end='', flush=True)

        image_raw = cv2.imread(path)
        if image_raw is None:
            continue

        dest_path = dest_image_root.joinpath(origin_image_labels[i])
        if not dest_path.exists():
            dest_path.mkdir()

        height, width = image_raw.shape[:2]
        short = min(height, width)
        ratio = short / 224
        new_height = int(height / ratio)
        new_width = int(width / ratio)

        resized = cv2.resize(image_raw, (new_width, new_height))
        name = 'img{}.jpg'.format(i)
        fullname = dest_path.joinpath(name)
        cv2.imwrite(str(fullname), resized)

