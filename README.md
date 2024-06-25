### 关于
项目主要实现WebRTC浏览器侧的基本功能，包括1V1视频，信息传输。服务端依赖[socket.io](https://socket.io)，也可以使用nodejs的ws模块实现，因为只是使用了最基本的WS通信功能。

后面有时间再研究WebRTC的库(比如[aiortc](https://github.com/aiortc/aiortc))，实现桌面版和[移动版](https://webrtc.github.io/webrtc-org/native-code/android/)	

### 使用
没什么特别的，直接安装后使用`node`开整，浏览器打开多个`http://localhost:3000`, 应该就能看到效果。
```bash
pnpm i
# 注意我使用的是v20.14.0
node --env-file .env index.mjs
```

### 注意事项
1. 如果部署线上，需要使用HTTPS协议，而且需要使用`turn`服务(需要用户名和密钥验证)
2. 使用时需要在根目录新建`.env`文件，里面要包括如下信息
```bash
IS_DEV=false # 主要控制是否打印服务端日志
PORT=3000 # 服务端监听接口
USE_SSL=false # 是否使用SSL，本地可以不使用
CERT=server_cert.crt # SSL 证书
KEY=server_key.pem # SSL 密钥
ICE_SERVERS="{
	iceServers: [{
		urls: 'stun:stun.l.google.com:19302'
	}]
}"
```