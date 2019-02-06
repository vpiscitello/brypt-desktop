#include "settings.h"

void Settings::Configure(const v8::FunctionCallbackInfo<v8::Value> &args) {
    // /* Pull JavaScript Settings Object to V8*/
    // const v8::Local<v8::Object> &options = args[1]->ToObject();
    //
    // /* Operation String Declarations */
    // const std::string NA = "NA";
    // const std::string pre_str = "preset", spl_str = "split", sor_str = "sort",
    //             invoke_str = "invoke", code_str = "code", queries_str = "queries",
    //             column_str = "column", method_str = "method";
    //
    // /* V8 Option Field Placeholders */
    // v8::Local<v8::Boolean> v8_pre_invoke, v8_spl_invoke, v8_sor_invoke;
    // v8::Local<v8::Integer> v8_sor_column;
    // v8::Local<v8::String> v8_pre_code, v8_sor_method;
    // v8::Local<v8::Array> v8_spl_queries;
    // v8::Local<v8::Object> v8_spl_query;
    //
    // /* V8 Filename Conversion and Save */
    // v8::String::Utf8Value v8_fil_name(args[0]);
    // std::string fil_name(*v8_fil_name);
    // std::istringstream iss(fil_name);
    //
    // std::getline(iss, file.name, '.');
    // std::getline(iss, file.ext, '.');
    // file.read_location = "tmp/convert/conv_" + file.name + ".csv";
    // file.save_location = "tmp/send/send_" + file.name + ".html";
    //
    // /* Split Nested Option Fields */
    // v8::Local<v8::Object> presetting = options->Get(v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), pre_str.c_str()))->ToObject();
    //
    // v8::Local<v8::Object> splitting = options->Get(v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), spl_str.c_str()))->ToObject();
    //
    // v8::Local<v8::Object> sorting = options->Get(v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), sor_str.c_str()))->ToObject();
    //
    //
    // /* Store V8 Presetting Data */
    // v8_pre_invoke = presetting->Get(v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), invoke_str.c_str()))->ToBoolean();
    // v8_pre_code = presetting->Get(v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), code_str.c_str()))->ToString();
    //
    // /* Store V8 Splitting Data */
    // v8_spl_invoke = splitting->Get(v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), invoke_str.c_str()))->ToBoolean();
    //
    // v8_spl_queries = v8::Handle<v8::Array>::Cast(splitting->Get(v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), queries_str.c_str())));
    //
    //
    // /* Store V8 Sorting Data */
    // v8_sor_invoke = sorting->Get(v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), invoke_str.c_str()))->ToBoolean();
    // v8_sor_column = sorting->Get(v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), column_str.c_str()))->ToInteger();
    // v8_sor_method = sorting->Get(v8::String::NewFromUtf8(v8::Isolate::GetCurrent(), method_str.c_str()))->ToString();
    //
    //
    // /* Convert and Save V8 Option Data */
    // preset.invoke = bool(*v8_pre_invoke);
    // if (preset.invoke) {
    //     preset.code = std::string(*v8::String::Utf8Value(v8_pre_code));
    // }
    //
    // split.invoke = bool(*v8_spl_invoke);
    // if (split.invoke) {
    //     split.queries.clear();
    //     for (uint32_t idx = 0; idx < v8_spl_queries->Length(); idx++) {
    //         v8_spl_query = v8::Handle<v8::Object>::Cast(v8_spl_queries->Get(idx));
    //         unsigned query_prop = unsigned(v8_spl_query->GetPropertyNames()->Get(0)->Int32Value());
    //         split.queries.push_back(
    //             std::pair<unsigned, std::string> (
    //                 query_prop,
    //                 std::string(*v8::String::Utf8Value(v8_spl_query->Get(query_prop)))
    //             )
    //         );
    //     }
    // }
    //
    // sort.invoke = bool(*v8_sor_invoke);
    // if (sort.invoke) {
    //     sort.column = int(v8_sor_column->Int32Value());
    //     if (std::string(*v8::String::Utf8Value(v8_sor_method)) == "ascend") {
    //         sort.method = 0;
    //     } else {
    //         sort.method = 1;
    //     }
    // }


}

Settings::~Settings() {};
