// main.js 或 App.vue 的 onMounted 中
import { registerSW } from 'virtual:pwa-register';

// 注册 Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('发现新内容，请刷新');
  },
  onOfflineReady() {
    console.log('应用可离线使用');
  }
});

// 申请通知权限并订阅推送
async function subscribeUserToPush() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.log('当前浏览器不支持推送通知');
    return;
  }

  // 请求权限
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    alert('需要通知权限才能接收验证提醒');
    return;
  }

  // 获取 Service Worker 注册对象
  const reg = await navigator.serviceWorker.ready;
  
  // 向你的后端获取 VAPID 公钥
  const response = await fetch('/api/vapid-public-key');
  const vapidPublicKey = await response.text();

  // 订阅推送服务
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  });

  // 将订阅对象发送给后端保存（关联用户的身份证号）
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idCard: '用户登录时填写的身份证号', // 实际开发中从登录态获取
      subscription: subscription
    })
  });
}

// 工具函数：转换公钥格式
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

subscribeUserToPush();
