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
