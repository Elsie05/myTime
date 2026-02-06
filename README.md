<video src="https://github.com/user-attachments/assets/a287b829-9344-4adc-bd87-0a3f54eb954c" controls="controls" width="500" height="300"></video>
1.	安装程序
小程序的开发工具官方名称为：“微信Web开发者工具”，官方下载地址为：https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html。在稳定版 Stable Build提供的Windows 64 、 Windows 32 、 macOS x64 和 macOS ARM64版本中选择自己的系统对应下载。
下载完成后，双击运行安装包，按照安装向导提示，一直到安装完成。
2.	配置软件与环境
	由于项目中使用了云开发功能，用户需要在微信公众平台官网注册申请微信小程序账号https://mp.weixin.qq.com/，。注册完成后可获取到相应的AppID。
双击打开微信Web开发者工具，使用微信登陆，在目录一栏浏览选中名为“myTime”的文件夹，输入获取到的自己的AppID，开发模式选择“小程序”，后端服务选择“微信云开发”。
	点击app.js文件，将其中env:’’中的内容替换为自己的。
 <img width="1352" height="612" alt="云开发环境" src="https://github.com/user-attachments/assets/80f5031f-63ac-4897-a27f-73b79559ff7c" />
	在云开发控制台添加6个集合：plan,tag,template,text,time,user。
	发送反馈功能配置：选择sendEmail云函数中的index.js文件，将其中的邮箱账号、邮箱授权码、发件人、收件人配置为自己的。邮箱的授权码需要在QQ邮箱里面开启SMTP。
 <img width="2126" height="1458" alt="邮箱设置" src="https://github.com/user-attachments/assets/a4a8283e-1903-4552-b8f1-73b99204cdcf" />
	语音识别功能配置：选择tc_sound云函数，将其中的腾讯云账户SecretId和SecretKey需要替换为自己的。
密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
<img width="2188" height="904" alt="腾讯云密钥" src="https://github.com/user-attachments/assets/acaf6239-71ab-4581-8472-53b31c3f20d6" />
