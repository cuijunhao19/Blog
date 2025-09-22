// src/utils/request.js
import axios from "axios";

// 1. 创建 Axios 实例（配置基础路径、超时时间）
const request = axios.create({
  baseURL: "http://localhost:5000", // 后端服务的基础地址（必须和后端一致）
  timeout: 5000, // 请求超时时间（5秒没响应则报错）
  headers: {
    "Content-Type": "application/json", // 默认请求头（告诉后端，前端传的是 JSON 格式）
  },
});

// 2. 请求拦截器（发送请求前做一些处理，比如加 Token，后续登录用）
request.interceptors.request.use(
  (config) => {
    // 这里暂时不需要加 Token（还没做登录），后续加登录功能时再补充
    return config; // 必须返回 config，否则请求会卡住
  },
  (error) => {
    // 请求发送失败时的处理（比如网络错误）
    console.error("请求发送失败：", error);
    return Promise.reject(error); // 把错误抛出去，让组件能捕获
  }
);

// 3. 响应拦截器（收到后端响应后，统一处理错误）
request.interceptors.response.use(
  (response) => {
    // 后端返回的成功数据（只取 response.data，简化组件中获取数据的代码）
    return response.data;
  },
  (error) => {
    // 后端响应失败的处理（比如接口不存在、服务器错误）
    let errorMsg = "请求失败，请稍后重试";
    if (error.response) {
      // 根据后端返回的状态码，自定义错误提示
      switch (error.response.status) {
        case 404:
          errorMsg = "接口不存在（404）";
          break;
        case 500:
          errorMsg = "服务器内部错误（500）";
          break;
        default:
          errorMsg = error.response.data?.message || errorMsg;
      }
    }
    console.error("请求响应失败：", errorMsg);
    return Promise.reject(errorMsg); // 把错误信息抛出去，组件中显示
  }
);

// 4. 导出封装好的 Axios 实例，供组件使用
export default request;
