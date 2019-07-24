import os

if 'AIBOX' in os.environ and os.environ['AIBOX']:
    DATA_ROOT = '/home/ethan/Pictures/tof_hackathon/gestures/'
else:
    DATA_ROOT = '/Users/ethan/datasets/tof_hackathon/gestures/'

IMAGE_WIDTH = 224
BATCH_SIZE = 64

# training params
TRAINING = {
    'alpha': 3e-5,
    'epochs': 100,
    'drop_rate': .7,
    'l2_reg': .5,
    'dense_layers': [100],
}
