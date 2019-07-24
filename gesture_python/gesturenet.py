import tensorflow as tf
from tensorflow.python.keras import Model
from tensorflow.python.keras.layers import Flatten, GlobalAveragePooling2D, GlobalMaxPooling2D, Dense, Dropout

import settings


class GestureNet:
    def __init__(self, num_classes, dense_layers=None, input_shape=(224, 224, 3), top_method='flatten', mobilenet_params=None):
        if dense_layers is None:
            dense_layers = []
        if mobilenet_params is None:
            mobilenet_params = {}

        base_model = self._get_base_model(input_shape, **mobilenet_params)
        bottleneck = base_model.output
        x = {
            'flatten': Flatten(),
            'avg': GlobalAveragePooling2D(),
            'max': GlobalMaxPooling2D()
        }[top_method](bottleneck)

        x = Dropout(settings.TRAINING['drop_rate'])(x)

        for units in dense_layers:
            init = tf.keras.initializers.VarianceScaling()
            x = Dense(units, activation='relu', kernel_initializer=init)(x)
            x = Dropout(settings.TRAINING['drop_rate'])(x)

        init = tf.keras.initializers.VarianceScaling()
        predictions = Dense(
            num_classes,
            activation='softmax',
            kernel_initializer=init,
            use_bias=False,
            kernel_regularizer=tf.keras.regularizers.l2(settings.TRAINING['l2_reg'])
        )(x)
        self.base_model = base_model
        self.model = Model(base_model.input, predictions)

    def _get_base_model(self, input_shape, **params):
        _base = tf.keras.applications.MobileNet
        return _base(include_top=False, input_shape=input_shape, **params)


if __name__ == '__main__':

    mobilenet_params = {
        'alpha': 1.,
        'depth_multiplier': 1,
    }

    engine = GestureNet(5, [100])
    engine.model.summary()
