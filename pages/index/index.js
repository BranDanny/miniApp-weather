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

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2 

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackgound: '',
    hourlyWeather: [],
    city: '上海市',
    locationAuthType: UNPROMPTED
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
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation'];
        this.setData({
          locationAuthType : auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED,
        })

        if (auth) {
          this.getCityAndWeather()
        } else {
          this.getNow()
        }
      }
    })
  },

  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city,
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

    for (let i = 0; i < 8; i++) {
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
      url: '/pages/list/list?city=' + this.data.city,
    })
  },

  onTapLocation() {
    if (this.data.locationAuthType === UNAUTHORIZED) {
      wx.openSetting({
        success: res => {
          let auth = res.authSetting['scope.userLocation'];
          if (auth) {
            this.getCityAndWeather()
          }
        }
      })
    } else {
      this.getCityAndWeather()
    }
  },

  getCityAndWeather() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city: city,
            })
            this.getNow()
          }
        })
      },
      fail: res => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
  }

})
