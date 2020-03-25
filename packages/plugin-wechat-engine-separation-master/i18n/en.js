'use strict';

module.exports = {
    'title': 'WeChat Game Separate Engine',
    'separate': 'Separate Engine',
    'separate_tips': 'This feature reduces the size of the first packet for each mini-game by sharing the global engine. When enabled, if the engine already has a cache in the phone, the first package download will automatically remove the engine file and load the full version of the engine cached in the phone. If there is no cache in the phone, the full first package will be loaded, and the complete first package will contain the culled engine (this feature only supports the official version of Cocos Creator and non-debug mode)',
};