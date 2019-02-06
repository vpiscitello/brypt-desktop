#ifndef SETTINGS_H
#define SETTINGS_H

#include <nan.h>
#include <node.h>
#include <iostream>
#include <string>
#include <sstream>
#include <unordered_map>

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
