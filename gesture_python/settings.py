import os

if 'AIBOX' in os.environ and os.environ['AIBOX']:
    DATA_ROOT = '/Users/ethan/datasets/tof_hackathon/'
else:
    DATA_ROOT = '/home/ethan/Pictures/tof_hackathon/gestures/'

IMAGE_WIDTH = 224
BATCH_SIZE = 64

# training params
TRAINING = {
    'alpha': 1e-4,
    'epochs': 20
}
