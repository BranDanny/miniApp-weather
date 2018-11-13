const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴天',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

Page({
  data: {
    nowTemp: '14°',
    nowWeather: '阴天',
    nowWeatherBackgound: '',
    hourlyWeather: []
  },

  //下拉刷新
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    });
  },

  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'VUIBZ-LIRKI-CFRGW-54AN4-ONOKZ-L3FR6'
    })
    this.getNow()
  },

  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '武汉市',
      },
      success: res => {
        let result = res.data.result;
        this.setNow(result);
        this.setHourlyWeather(result);
        this.setToday(result);
      },
      complete: () => {
        callback && callback();
      }
    })
  },

  setNow(result) {
    let temp = result.now.temp + '°';
    let weather = result.now.weather;

    this.setData({
      nowTemp: temp,
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })

    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },

  setHourlyWeather(result) {
    //set forecast
    let forecastData = result.forecast;
    let nowHour = new Date().getHours();
    let hourlyWeather = [];

    for(let i = 0; i < 8; i++) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecastData[i].weather + '-icon.png',
        temp: forecastData[i].temp + '°'
      })
    }

    hourlyWeather[0].time = '现在';

    this.setData({
      hourlyWeather: hourlyWeather
    })
  },

  setToday(reslut) {
    let date = new Date();
    this.setData({
      todayTemp: `${reslut.today.minTemp}° ~ ${reslut.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 今天` 
    })
  },

  onTapDayWeather() {
    wx.navigateTo({
      url: '/pages/list/list',
    })
  },

  onTapLocation() {
    wx.getLocation({
      success: res => {
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            cosnole.log(res);
          }
        })
      }
    })
  }

})
