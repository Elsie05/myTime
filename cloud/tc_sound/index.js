// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
     // Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
    const tencentcloud = require("tencentcloud-sdk-nodejs-asr");

    const AsrClient = tencentcloud.asr.v20190614.Client;

    // 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意   密钥对的保密
    // 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。    以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.    tencent.com/document/product/1278/85305
    // 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取
    const clientConfig = {
      credential: {
        secretId: "",//腾讯云账号
        secretKey: "",//腾讯云密钥
      },
      region: "",
      profile: {
        httpProfile: {
          endpoint: "asr.tencentcloudapi.com",
        },
      },
    };

    // 实例化要请求产品的client对象,clientProfile是可选的
    const client = new AsrClient(clientConfig);
    const params = {
        "EngSerViceType": "16k_zh",
        "SourceType": 1,
        "VoiceFormat": event.voiceFmt,//音频格式
        "Data": event.soundBase64,//音频二进制数据(Base64编码)
        "DataLen": event.soundLen//音频长度
    };
    return new Promise((resolve, reject) =>{ //返回promise
      client.SentenceRecognition(params).then(
        (data) => {
          console.log(data);
          resolve({"result":data}) //返回数据
        },
        (err) => {
          console.error("error", err);
          reject({"result":err}) //返回错误消息
        }
      );
    }
    ); //promise结束
}