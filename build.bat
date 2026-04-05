@echo off
SET JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
SET ANDROID_HOME=C:\Users\essor\AppData\Local\Android\Sdk
SET PATH=%PATH%;C:\Users\essor\AppData\Local\Android\Sdk\platform-tools
echo Starting build with:
echo JAVA_HOME: %JAVA_HOME%
echo ANDROID_HOME: %ANDROID_HOME%
npx.cmd expo run:android
