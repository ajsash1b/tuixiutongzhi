import { onMounted, onUnmounted } from 'vue'

let pollingTimer = null

onMounted(() => {
  // 页面加载后先查一次
  fetchVerificationTasks()

  // 每一小时 (3600000 毫秒) 轮询一次
  pollingTimer = setInterval(() => {
    fetchVerificationTasks()
  }, 3600000)
})

onUnmounted(() => {
  clearInterval(pollingTimer)
})

function fetchVerificationTasks() {
  // 请求后端接口获取最新任务列表
  // fetch('/api/tasks')...
  console.log('执行了每小时数据轮询检查...');
}
