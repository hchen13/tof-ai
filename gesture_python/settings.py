import os

if 'AIBOX' in os.environ and os.environ['AIBOX']:
    DATA_ROOT = '/home/ethan/Pictures/tof_hackathon/gestures/'
else:
    DATA_ROOT = '/Users/ethan/datasets/tof_hackathon/gestures/'

IMAGE_WIDTH = 224
BATCH_SIZE = 64

# model params
MODEL_CONFIG = {
    'drop_rate': .5,
    'l2_reg': .2,
    'dense_layers': [100]
}

# training params
TRAINING = {
    'alpha': 7e-5,
    'epochs': 50,
}
