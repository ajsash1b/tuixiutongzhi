const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// 模拟数据库，存储用户身份证号与推送订阅对象的映射
const userSubscriptions = {};

// 1. 生成 VAPID 密钥对（仅首次运行需要，生成后固定使用）
// console.log(webpush.generateVAPIDKeys());
const publicVapidKey = '你的Public_Key';
const privateVapidKey = '你的Private_Key';

webpush.setVapidDetails('mailto:your-email@example.com', publicVapidKey, privateVapidKey);

// 提供静态文件（PWA前端）
app.use(express.static(path.join(__dirname, 'dist')));

// 接口：提供公钥给前端
app.get('/api/vapid-public-key', (req, res) => {
  res.send(publicVapidKey);
});

// 接口：前端注册订阅
app.post('/api/subscribe', (req, res) => {
  const { idCard, subscription } = req.body;
  userSubscriptions[idCard] = subscription; // 保存到数据库
  res.status(201).json({});
});

// 接口：厂领导输入身份证号后触发通知
app.post('/api/notify', (req, res) => {
  const { idCard } = req.body; // 厂领导提交的身份证号

  const subscription = userSubscriptions[idCard];
  if (!subscription) {
    return res.status(404).send('该用户尚未注册PWA通知');
  }

  const payload = JSON.stringify({
    title: '退休人员验证提醒',
    body: '请尽快打开系统完成本月退休人员验证工作。',
    url: 'https://你的域名.com/dashboard' // 点击通知后跳转的页面
  });

  // 向用户设备发送 Push 通知
  webpush.sendNotification(subscription, payload)
    .then(() => res.status(200).json({ message: '通知发送成功' }))
    .catch(err => {
      console.error('发送失败:', err);
      res.status(500).send('发送失败');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
