#ifndef SETTINGS_H
#define SETTINGS_H

#include <nan.h>
#include <node.h>

class Settings : public Nan::ObjectWrap {
    private:
        std::string key;
        unsigned int nonce;

    public:
        Settings();
        ~Settings();

        void Configure(const v8::FunctionCallbackInfo<v8::Value> &args);

};

#endif
