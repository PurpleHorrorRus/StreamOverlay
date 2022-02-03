# Stream Overlay

> Оверлей, который выводится поверх игры для стримеров с одним дисплеем. 

Вы можете присоединить свой аккаунт Twitch с этим приложением, чтобы видеть и контролировать сообщения в Вашем чате. Не упустите своих зрителей!

Опционально Вы можете настроить подключение через OBS Websocket для синхронизации состояния ваших устройств. С этим у вас будет возможность контролировать состояния Ваших устройств, видимости веб-камер, а так же отслеживать время и техническое состояние (битрейт, FPS и т.д.) сессии вашего стрима или записи, приложение всегда Вас предупредит о возможных проблемах.

Приложение потребляет очень мало ресурсов ПК, поэтому не влияет на FPS в играх (кроме некоторых случаев, смотри ниже).

Приложение работает только под операционной системой Windows 7 и выше. Поддерживает только русский язык.

**Внимание!** Это приложение идеально работает только с безрамочными играми или оконными играми. Приложение точно не отобразится поверх полноэкранных игр, использующих Vulkan API для отрисовки графики, но для DirectX могут быть исключения.

**Внимание!** На некоторых устаревших конфигурациях ПК (проверено на старой линейке Intel i3 и NVIDIA GeForce GTX 9 серии) были замечены локи FPS до 45 в очень редких случаях. Например, такое случалось в League of Legends в режиме окна без рамки, так как приложение выводится прозрачным неактивным окном, но система всё равно считает, что поверх игры есть ещё одно окно. На процессорах AMD (FX и Ryzen) такой проблемы не замечено. Решение - переключить в настройках клиента игры "использовать DirectX 9 (устаревшее)", в крайнем случае запустить игру в окне.

# Development

Run these commands to start developing:

```bash
# Installation
git clone https://github.com/PurpleHorrorRus/StreamOverlay.git
yarn

# Run in Dev mode:
yarn dev

# To build:
yarn build
```

**Attention!** Application using [this C++ addon](https://github.com/PurpleHorrorRus/StreamOverlayAddon) to call low-level system functions. So if you don't have configured node-gyp, you can delete this addon from ```package.json``` and all mentions in the code before installation rest packages.