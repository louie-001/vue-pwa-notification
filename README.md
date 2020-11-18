> PWA，即 Progressive web apps（渐进式 Web 应用），PWA使得web应用具有与原生应用类似的用户体验，如离线运行、添加到主屏、消息通知等（[详细介绍](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps/Introduction)）。本文介绍VUE工程中使用@vue/cli-plugin-pwa插件实现消息通知并刷新VUE组件。

# 创建VUE工程并安装PWA插件
终端执行以下命令创建vue-pwa-notification工程：
```
vue create vue-pwa-notification
````

执行以下命令安装PWA插件：
```
cd vue-pwa-notification
vue add @vue/pwa
```

安装完成后工程结构：
```
.
├── babel.config.js
├── package.json
├── package-lock.json
├── public
│   ├── favicon.ico
│   ├── img
│   │   └── icons
│   ├── index.html
│   └── robots.txt
├── README.md
└── src
    ├── App.vue
    ├── assets
    │   └── logo.png
    ├── components
    │   └── HelloWorld.vue
    ├── main.js
    └── registerServiceWorker.js
```

# 安装AXIOS，实现API client
安装axios：
```
npm i axios
```

src下创建plugins目录，plugins目录下新建axios.js:
```javascript
// plugins/axios.js
import Axios from "axios";

const axios = Axios.create({
    // 实际开发中应使用环境配置
    baseURL: 'http://192.168.3.90:3000',
    timeout: 10 * 1000,
    withCredentials: false
})

/**
 * 请求拦截器
 */
axios.interceptors.request.use(config => {
    config.headers.Authorization = sessionStorage.getItem('access_token')
    return config
}, error => {
    return Promise.reject(error)
})

/**
 * 响应拦截器
 */
axios.interceptors.response.use(response => {
    return response
}, error => {
    // 响应错误
    return Promise.reject(error)
})

export default axios


```

# 修改registerServiceWorker.js
service worker就绪后订阅消息服务并提交subscribe至server端保存：

```javascript
// registerServiceWorker.js
import {register} from 'register-service-worker'
import axios from "@/plugins/axios";

// 公钥
const publicKey = 'BO_sjITRaeBOaC5UDMb6L3_h64FMRozOAgct02jsKcfjvM6SuKcJjQTMXBBGM5H3xhT1u-Oz11_Gi1yC8RDsin4'

if (process.env.NODE_ENV === 'production') {
    register('./sw.js', {
        // service worker 就绪
        ready(registration) {
            console.log(
                'App is being served from cache by a service worker.\n' +
                'For more details, visit https://goo.gl/AFskqB'
            )
            // 订阅web push服务，成功后提交endpoint至服务端保存
            const convertedVapidKey = urlBase64ToUint8Array(publicKey);
            const subscribeOption = {
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey,
            }
            registration.pushManager.subscribe(subscribeOption).then(endpoint => {
                // 提交endpoint
                axios.post('endpoint', endpoint).then(res => {
                    console.log('save push endpoint result, ' + JSON.stringify(res))
                })
            })
        },
        registered() {
            console.log('Service worker has been registered.')
        },
        cached() {
            console.log('Content has been cached for offline use.')
        },
        updatefound() {
            console.log('New content is downloading.')
        },
        updated() {
            console.log('New content is available; please refresh.')
        },
        offline() {
            console.log('No internet connection found. App is running in offline mode.')
        },
        error(error) {
            console.error('Error during service worker registration:', error)
        }
    })
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
```
server端保存endpoint，push消息时根据特定条件获取要通知的endpoint，然后sendNotification。


# vue.config.js配置pwa
```javascript
module.exports = {
    publicPath: './',
    pwa: {
        name: 'notification',
        themeColor: '#1976D2',
        msTileColor: '#FFFFFF',
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            swSrc: 'src/sw.js'
        }
    }
}

```
# src下新建sw.js
service worker注册push事件监听
```javascript
self.addEventListener('push', evt => {
    const message = evt.data.json()
    // 显示通知
    self.registration.showNotification(message.title, {
        body: message.content
    })
})
```
首次访问时应用将获取通知权限，如下：
![notice permission](https://raw.githubusercontent.com/louie-001/static-resource/main/permission)

调用server端发送消息，terminal执行：
```
curl -X POST http://192.168.3.90:3000/message -b '{"title": "system notification","content": "nice, this is a notification from web-push"}' -H "Content-Type: application/json"
```
消息通知：
![notification](https://raw.githubusercontent.com/louie-001/static-resource/main/notification)

# web push更新VUE DATA
service woker接收到server端Push的通知后，当我们点击通知，将消息内容显示在vue组件中。

sw.js中注册通知点击事件：
```javascript
self.addEventListener('notificationclick', evt => {
    evt.notification.close()
    // 获取client
    evt.waitUntil(self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
            // postMessage将信息发送给界面
            client.postMessage(evt.notification.body)
        })
    }))
})
```

App.vue中注册message监听：
```javascript
// App.vue
  mounted() {
    navigator.serviceWorker.addEventListener('message', evt => {
      this.response = evt.data
    })
  }
```

vue工程需build后部署运行，因为@vue/cli-plugin-pwa插件只在production环境运行，因为若service worker在dev环境启用，则缓存资源导致本地变更不能被使用。

> 1. 本文源码地址：https://github.com/louie-001/vue-pwa-notification.git
> 2. server端如何保存endpoint以及使用web push推送消息，请查看https://juejin.im/post/6890733677534248974
