{
    "variables": {
        'node_shared_openssl%': 'true'
    },
    "targets": [{
        "target_name": "brypt-crypto",
        'cflags!': [ '-fno-exceptions' ],
        'cflags_cc!': [ '-fno-exceptions' ],
        "sources": [
            "./src/crypto/crypto.cpp",
        ],
        'conditions': [
            [ 'OS=="win"', {
                'conditions': [
                    ['target_arch=="x64"', {
                        'variables': {
                        'openssl_root%': 'C:/OpenSSL-Win64'
                    },
                    }, {
                        'variables': {
                            'openssl_root%': 'C:/OpenSSL-Win32'
                        },
                    }],
                ],
                'defines': [
                    'uint=unsigned int',
                ],
                'libraries': [
                    '-l<(openssl_root)/lib/libeay32.lib',
                ],
                'include_dirs': [
                    '<(openssl_root)/include',
                    "<!(node -e \"require('nan')\")"
                ],
            }, { # OS!="win"
                'libraries': [
                    "-L/usr/local/opt/openssl/include/openssl",
                    "-L/usr/local/Cellar/openssl/1.0.2q/include/openssl",
                    "-L/usr/local/opt/openssl/lib",
                    "-L/usr/local/opt/openssl/include",
                ],
                'include_dirs': [
                    "<!(node -e \"require('nan')\")",
                    "/usr/local/opt/openssl/include/openssl",
                    "/usr/local/Cellar/openssl/1.0.2q/include/openssl",
                    "/usr/local/opt/openssl/lib/libssl.1.0.0.dylib",
                ],
            }],
            ['OS=="mac"', {
                'xcode_settings': {
                    'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                    "OTHER_CFLAGS": [
                        "-std=c++11",
                        "-stdlib=libc++",
                        "-Wall",
                        "-lcrypto",
                        "-lssl"
                    ]
                }
            }],
            ['OS=="linux"', {
                "OTHER_CFLAGS": [
                    "-std=c++11",
                    "-stdlib=libc++",
                    "-Wall",
                    "-lcrypto",
                    "-lssl"
                ]
            }],
            ['OS=="win"', {
                "OTHER_CFLAGS": [
                    "-std=c++11",
                    "-stdlib=libc++",
                    "-Wall",
                    "-lcrypto",
                    "-lssl"
                ]
            }]
        ],
    }]
}
