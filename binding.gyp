{
    "targets": [{
        "target_name": "brypt-crypto",
        'cflags!': [ '-fno-exceptions' ],
        'cflags_cc!': [ '-fno-exceptions' ],
        'conditions': [
            ['OS=="mac"', {
                'xcode_settings': {
                    'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                    "OTHER_CFLAGS": [
                        "-std=c++11",
                        "-stdlib=libc++",
                        "-Wall",
                        "-lcrypto"
                    ]
                }
            }],
            ['OS=="linux"', {
                "OTHER_CFLAGS": [
                    "-std=c++11",
                    "-stdlib=libc++",
                    "-Wall",
                    "-lcrypto"
                ]
            }],
            ['OS=="win"', {
                "OTHER_CFLAGS": [
                    "-std=c++11",
                    "-stdlib=libc++",
                    "-Wall",
                    "-lcrypto"
                ]
            }]
        ],
        "sources": [
            "./src/crypto/crypto.cpp",
        ],
        "include_dirs": [
            "<!(node -e \"require('nan')\")"
        ]
    }]
}
