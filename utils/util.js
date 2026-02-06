//该函数接收 JavaScript Date 对象，并返回一个以 "YYYY/MM/DD HH:MM:SS "格式表示日期的字符串。
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

// 获取一个数字，并以字符串形式返回，如果数字小于 10，则以零开头。
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

//导出了 formatTime 函数，使其可用于应用程序的其他部分。
module.exports = {
  formatTime
}
