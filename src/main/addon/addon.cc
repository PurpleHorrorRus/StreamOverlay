/*
    Переедем на более свежую версию NODE_MODULE_VERSION сразу же, 
    как выйдет Electron 12.0
*/

#include <node.h>
#include <windows.h>
#include <tlhelp32.h>
#include <atlbase.h>
#include <iostream>

namespace OverlayAddon
{
    using v8::Array;
    using v8::Context;
    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::NewStringType;
    using v8::Number;
    using v8::Object;
    using v8::String;
    using v8::Uint32;
    using v8::Value;

    wchar_t *convertCharArrayToLPCWSTR(const char *charArray)
    {
        wchar_t *wString = new wchar_t[4096];
        MultiByteToWideChar(CP_ACP, 0, charArray, -1, wString, 4096);
        return wString;
    }

    DWORD_PTR GetMask(HANDLE handle, int num)
    {
        DWORD_PTR processAffinityMask;
        DWORD_PTR systemAffinityMask;

        if (GetProcessAffinityMask(handle, &processAffinityMask, &systemAffinityMask))
        {
            int cores = 0;

            for (int i = 0; i < sizeof(DWORD_PTR) * 4; i++)
            {
                if ((systemAffinityMask & ((DWORD_PTR)1 << i)))
                    cores++;
            }

            // Limit max CPUs by user configuration
            DWORD_PTR newAffinityMask = 0;
            if (num < cores)
            {
                int m = 0;
                for (int i = 0; i < sizeof(DWORD_PTR) * 4; i++)
                {
                    if ((systemAffinityMask & ((DWORD_PTR)1 << i)))
                    {
                        newAffinityMask |= ((DWORD_PTR)1 << i);
                        m++;
                        if (m == num)
                            break;
                    }
                }

                newAffinityMask <<= (cores - num);
            }
            else
                newAffinityMask = systemAffinityMask;

            return newAffinityMask;
        }

        return processAffinityMask;
    }

    void ProcessList(const FunctionCallbackInfo<Value> &args)
    {
        Isolate *isolate = args.GetIsolate();

        Local<Context> context = isolate->GetCurrentContext();
        Local<Array> arr = Array::New(isolate);

        HANDLE snap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);

        if (snap == INVALID_HANDLE_VALUE)
            return;

        PROCESSENTRY32 entry;
        entry.dwSize = sizeof(PROCESSENTRY32);

        if (!Process32First(snap, &entry))
        {
            CloseHandle(snap);
            return;
        }

        int i = 0;

        while (Process32Next(snap, &entry))
        {
            Local<Object> obj = Object::New(isolate);
            CW2A exe(convertCharArrayToLPCWSTR(entry.szExeFile), CP_UTF8);

            obj->Set(
                   context,
                   String::NewFromUtf8(isolate, "name", NewStringType::kNormal).ToLocalChecked(),
                   String::NewFromUtf8(isolate, exe.m_psz, NewStringType::kNormal).ToLocalChecked())
                .FromJust();

            obj->Set(
                   context,
                   String::NewFromUtf8(isolate, "pid", NewStringType::kNormal).ToLocalChecked(),
                   Number::New(isolate, entry.th32ProcessID))
                .FromJust();

            arr->Set(context, i, obj);
            i++;
        }

        CloseHandle(snap);
        args.GetReturnValue().Set(arr);
    }

    void SetLowPriority(const FunctionCallbackInfo<Value> &args)
    {
        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();

        String::Utf8Value pid(isolate, args[0]);
        std::string cppStr(*pid);

        if (HANDLE handle = OpenProcess(PROCESS_ALL_ACCESS, true, strtol(*pid, 0, 0)))
        {
            SetPriorityClass(handle, 0x00000040);
            SetProcessAffinityMask(handle, GetMask(handle, 1));
            CloseHandle(handle);
        }
    }

    void Initialize(Local<Object> exports)
    {
        NODE_SET_METHOD(exports, "ProcessList", ProcessList);
        NODE_SET_METHOD(exports, "SetLowPriority", SetLowPriority);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
} // namespace OverlayAddon
