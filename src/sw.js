/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('push', evt => {
    const message = evt.data.json()
    self.registration.showNotification(message.title, {
        body: message.content
    })
})

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
