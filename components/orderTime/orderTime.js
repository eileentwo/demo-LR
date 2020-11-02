// mzhk_sun/plugin7/book/orderTime/orderTime.js
const app=getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    checkeddate:{
      type:String,
      value:'',
    },
    data1:{
      type:Array,
      observer(newVal){
      }
    },
    year: {
      type:Number,
      observer(newVal){
        if(newVal){
          this.dateInit(newVal,this.data.month)
        }
      }
    },
    month: {
      type:Number
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0,
    startTime:'09:00'
  },

  /**
   * 组件的方法列表
   */
  methods: {

    dateInit: function (setYear, setMonth) {
      //全部时间的月份都是按0~11基准，显示月份才+1
      let dateArr = [];                       //需要遍历的日历数组数据
      let arrLen = 0;                         //dateArr的数组长度
      let now = setYear ? new Date(setYear, setMonth) : new Date();
      let year = setYear || now.getFullYear();
      let nextYear = 0;
      let month = setMonth || now.getMonth();                 //没有+1方便后面计算当月总天数
      let nextMonth = (month) > 11 ? 1 : (month);
      let startWeek = new Date(year + '/' + (month ) + '/' + 1).getDay();                          //目标月1号对应的星期
      console.log(now,year + '/' + (month ) + '/' + 1,startWeek,56666666666)
      let dayNums = new Date(year, nextMonth, 0).getDate();               //获取目标月有多少天
      let obj = {};
      let num = 0;
      let data1=this.data.data1;
  
      if (month > 11) {
        nextYear = year + 1;
        dayNums = new Date(nextYear, nextMonth, 0).getDate();
      }
      arrLen = startWeek + dayNums;
      let y=new Date().getFullYear();
      let m=this.returnStr(new Date().getMonth() + 1);
      let d=this.returnStr(new Date().getDate());
      let today= ''+ y+m + d;
      console.log(arrLen,711)
      for (let i = 0; i < arrLen; i++) {
        if (i >= startWeek) {
          let week=i%7;
          num = i - startWeek + 1;
          num=this.returnStr(num);
          let mo=this.returnStr(month);
          let isToday= '' + year +mo + num;
          let isOver=false;
          if(isToday<today){
            isOver=true;
          }
          let checked=false;
          console.log(today,isToday,this.data.checkeddate)
          if(isToday==this.data.checkeddate || isToday==today&&this.data.checkeddate==''){
            checked=true;
          }
          let obj1 = {
            isToday,
            checked,
            week,isOver,
            isT:isToday==today,
            year,month:mo,day:num,
          }
          
          for(let j in data1){
            let d1=data1[j].year+''+data1[j].month+''+data1[j].day;
            data1[j].retail_price=parseFloat(data1[j].retail_price).toFixed(2);
            data1[j].times=[];
            if(data1[j].periodList&&data1[j].periodList!=2&&data1[j].periodList.length>0){
              for(let k in data1[j].periodList){
                let str='';
                str=data1[j].periodList[k].start_time+'-'+data1[j].periodList[k].end_time;
                data1[j].times.push(str)
              }
            }
            if(d1==isToday){
              obj=Object.assign(obj1,data1[j])
            }else{
              obj=obj1
            }
          }
        } else {
          obj = {};
        }
        dateArr[i] = obj;
      }
      this.setData({
        dateArr: dateArr,
        isToday:today
      })
      let nowDate = new Date();
      let nowYear = nowDate.getFullYear();
      let nowMonth = nowDate.getMonth() + 1;
      let nowWeek = nowDate.getDay();
      let getYear = setYear || nowYear;
      let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;
      if (nowYear == getYear && nowMonth == getMonth) {
        this.setData({
          isTodayWeek: true,
          todayIndex: nowWeek
        })
      } else {
        this.setData({
          isTodayWeek: false,
          todayIndex: -1
        })
      }
    },
    returnStr(m){
      return m>9?m:'0'+m;
    },
    returnFn(){
      return
    },
    selectFn(e){
      let item=this.data.dateArr[e.currentTarget.dataset.index];
      let startTime='';
      let remain=item.remain?item.remain:0;
      if(item.periodList&&item.periodList!=2&&item.periodList.length>0){
        let v=e.detail.value;
        remain=app.func.getstorage(item,v);
        if(remain==0){
          app.showToastFn("该时间段内无可购买票",3000);
          return
        }
        let nowTime=new Date().getTime();
        let t1=item.times[v].split('-');
        if(new Date(item.date+' '+t1[1]).getTime()<nowTime ){
          remain=0;
          app.showToastFn("该时间段内无可购买票",3000);
          return
        }
        startTime=t1[0]
      }else{
        remain=item.remain
      }
      if(item.retail_price){
        this.triggerEvent('select',{item,startTime,remain:remain,})
      }
    },
  }
})
