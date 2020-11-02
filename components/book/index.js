// zhy/component/book/index.js
const app=getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    stime:{type:String,value:'',observer(newVal){
      wx.setStorageSync('dhstime', newVal)
    }},
    etime:{type:String,value:'',observer(newVal){ 
      wx.setStorageSync('dhetime', newVal)
      if(parseFloat(newVal)>0){
      if(parseFloat(newVal)<parseFloat(new Date().getTime())){
        app.showModalFn('提示',"已过期，无法预约",()=>{},0);
        this.hideOrderFn()
      }
    }}},
    ordermethod:{type:String,value:'0',observer(newVal){}},
    showorder:{type:Boolean,value:false,observer(newVal){
      if(newVal){
        let that=this;
        if(this.data.ordermethod>0){
          let data={
            oid:this.data.oid,
            userid:wx.getStorageSync("users").id,//用户id
            m:app.globalData.Plugin_stock,
          };
          if(this.data.otype==3){data.type=1}
          app.util.request({
            'url': 'entry/wxapp/GetGoodsAppointment',
            data,
            success: function (res) {
              that.setData({
                orderinfo:res.data,
              })
            },
          })
          return
        }
        let etime=that.data.etime || wx.getStorageSync('dhetime'),booktime=that.data.booktime,stime=that.data.stime || wx.getStorageSync('dhstime'),bookstart=0;
        if(stime>0&&stime>new Date().getTime()){
          bookstart=1
        }
        if(etime>0){
          if(bookstart==0){
            booktime= that.daysDistance(etime)
          }else{
            booktime= that.daysDistance(etime,stime)
          }
        }
        console.log(etime,stime,booktime,new Date().getTime(),stime>new Date().getTime())
        let orderinfo=this.data.resetinfo?{}:this.data.orderinfo;
        that.setData({booktime,bookstart,multiArray: [[], ['00'], ['00分']], multiIndex: [0, 0, 0],orderinfo})
        that.setmultiArray();
      }
    }},
    oid:{type:String,observer(newVal){
      if(newVal){}
    }},
    gid:{type:String},
    otype:{type:Number,value:1},
  },

  /**
   * 组件的初始数据
   */
  data: {
    multiArray: [[], ['00'], ['00分']],
    multiIndex: [0, 0, 0],
    ordertime:'请选择预约时间',
    showShop:false,
    keywordds:'',
    isA:true,
    shoppage:0,
    shops:[],
    bname:'',
    resetinfo:true,
    orderinfo:{},
    booktime:365,
    bookstart:0,
    choosIndex:0,
    shop:''
  },
  /**
   * 组件的方法列表
   */
  methods: {
    daysDistance(date1, date2) {     
      //parse() 是 Date 的一个静态方法 , 所以应该使用 Date.parse() 来调用，而不是作为 Date 的实例方法。返回该日期距离 1970/1/1 午夜时间的毫秒数
      date2 = date2?date2:new Date().getTime();
      console.log(date2)
      //计算两个日期之间相差的毫秒数的绝对值
      var ms= Math.abs(date1 - date2);
      //毫秒数除以一天的毫秒数,就得到了天数
      var days = Math.floor(ms / (24 * 3600 * 1000));
      return days ;
    },  
  submitFn(){
    if(this.data.ordermethod>0){
      this.triggerEvent('hide');
      this.setData({
        orderinfo:{},multiArray: [[], ['00'], ['00分']]
      })
      return
    }
    let orderinfo=this.data.orderinfo;
    if(!orderinfo.name||orderinfo.name==''){
      app.showToastFn('请输入预约联系人姓名');
      return;
    }
    if(!orderinfo.tel||orderinfo.tel==''){
      app.showToastFn('请输入预约联系人电话')
      return;
    }
    if(orderinfo.tel.length!=11){
      app.showToastFn('手机号必须是11位数');
      return;
    }
    if(!orderinfo.bname ||orderinfo.bname==''){
      app.showToastFn('请选择预约商家')
      return;
    }
    if(!orderinfo.selecttime){
      app.showToastFn('请选择预约时间')
      return;
    }
    let choosed=this.data.choosed,shops=this.data.shops,that=this;
    app.util.request({
      'url': 'entry/wxapp/AddAppointment',
      data:{
        gid:this.data.otype==3?shops[choosed].gid:this.data.gid,
        oid:this.data.oid,//订单id
        bid:shops[choosed].bid,
        wid:shops[choosed].wid, //仓库id
        sid:shops[choosed].sid,//供应商id
        costprice:shops[choosed].costprice,
        name:orderinfo.name,
        tel:orderinfo.tel,
        appointtime:orderinfo.selecttime,
        remarks:orderinfo.remarks?orderinfo.remarks:'',
        userid:wx.getStorageSync("users").id,//用户id
        m:app.globalData.Plugin_stock,
        type:this.data.otype
      },
      success: function(res) {
        that.setData({
          orderinfo:{},multiArray: [[], ['00'], ['00分']], multiIndex: [0, 0, 0],
        })
        if(res.data&&res.data.data&&res.data.data.errno==1){
          app.showModalFn('提示',res.data.data.message,()=>{
          },0)
          that.hideOrderFn();
          return
        }
        that.triggerEvent('submit');
      },
      fail(res){
      }
    })
  },
  changeorderinfo(e){
    let orderinfo=this.data.orderinfo,index=e.currentTarget.dataset.index,val=e.detail.value;
    if(index==0){
      orderinfo.name=val
    }else if(index==1){
      orderinfo.tel=val
    }else if(index==2){
      orderinfo.remarks=val
    }
    this.setData({
      orderinfo
    })
  },
  hideshop(){
    this.setData({
      showShop:false,
      showorder:true,
      resetinfo:true
    })
  },
  choosItem(e){
    let orderinfo=this.data.orderinfo,shops=this.data.shops,choosed=e.currentTarget.dataset.index;
    orderinfo.bname=shops[choosed].bname;
    this.setData({
      orderinfo,choosed,showShop:false,showorder:true,
    })
  },
  chooseShop(page){
    if(this.data.ordermethod==0){
    page=page?page:0;
    let that=this;
    app.util.request({
      'url': 'entry/wxapp/GetAppointmentBrand',
      data:{
        oid:this.data.oid,
        keywordds:this.data.keywordds,
        m:app.globalData.Plugin_stock,
        type:this.data.otype
      },
      success: function(res) {
        let data=res.data,shops=page>0?this.data.shops:[];
        let isA=false;
        if(data!=2&&data.length>0){
          isA=data.length>4?true:false;
          for(let i=0;i<data.length;i++){
            shops.push(data[i])
          }
        }
        if(app.app_type && app.app_type != 'app'){
          that.setData({shoppage:page})
        }
        that.setData({
          shops,
          isA,
          showShop:true,
          showorder:false,
          resetinfo:false
        })
      },
      fail(res){
        that.hideshop()
        that.hideOrderFn()
      }
    })
    this.setData({
      showShop:true
    })}
  },
  scrollFn(e){
    let shoppage=this.data.shoppage;
    if(this.data.isA){
      shoppage++;
      this.chooseShop(shoppage)
    }else{
      app.showToastFn('没有更多了哦')
    }
  },
  setKeyword(e){
    this.setData({
      keywordds:e.detail.value
    })
  },
  strtotime(time_str, fix_time) {
    var time = (new Date()).getTime();
    if(time_str) {//有日期段
    var str = time_str.split('-');
    if (3 === str.length) {
    var year = parseInt(str[0]) - 0; 
    var month = parseInt(str[1]) - 0 - 1;//月份是从0开始的
    var day = parseInt(str[2]) - 0;
    if(fix_time) {//有时间段
    var fix = fix_time.split(':');
    if (3 === fix.length) {
    var hour = parseInt(fix[0]) - 0; 
    var minute = parseInt(fix[1]) - 0;
    var second = parseInt(fix[2]) - 0;
    
    time = (new Date(year, month, day, hour, minute, second)).getTime();
    }
    } else {
    time = (new Date(year, month, day)).getTime();
    }
    }
    }
    // time = time / 1000;//转到到秒数
    return time;
    },
  bindMultiPickerChange: function (e) {
    let multiArray=this.data.multiArray,multiIndex=e.detail.value,
    day=multiArray[0][multiIndex[0]],
    h=multiArray[1][multiIndex[1]],
    s=multiArray[2][multiIndex[2]],
    orderinfo=this.data.orderinfo;
    orderinfo.selecttime=day+' '+h+':'+s;
    this.setData({
      orderinfo:JSON.parse(JSON.stringify(orderinfo)),multiIndex
    })
  },
  bindMultiPickerColumnChange: function (e) {
    let multiArray=JSON.parse(JSON.stringify(this.data.multiArray)),
    multiIndex=JSON.parse(JSON.stringify(this.data.multiIndex));
    multiIndex[e.detail.column] = e.detail.value;
    let time=this.fwriteCurrentDate(),etime=new Date(this.data.etime*1),l=multiArray[0].length-1,stime=new Date(this.data.stime*1);
    switch (e.detail.column) {
      case 0:
        switch(multiIndex[0]){
          case 0:
            if(stime>0&&this.data.bookstart>0){
              let eh=stime.getHours(),em=stime.getMinutes();
              multiArray[1] = this.setTimeFn(24,eh);
              multiArray[2] = this.setTimeFn(60,em);
            }else{
              multiArray[1] = this.setTimeFn(24,parseFloat(time.h*1+1));
              multiArray[2] = this.setTimeFn(60,0);
            }
            break;
          case l:
            let eh=etime.getHours(),em=etime.getMinutes();
            console.log(eh,etime)
            if(this.data.booktime>0&&eh>0){
              multiArray[1] = this.setTimeFn(em>0?eh+1:eh,0);
              multiArray[2] = this.setTimeFn(em,0,1);
            }else{
              multiArray[1] = this.setTimeFn(24);
              multiArray[2] = this.setTimeFn(60,0);
            }
            break;
          default:
            multiArray[1] = this.setTimeFn(24);
            multiArray[2] = this.setTimeFn(60);
        }
        multiIndex[1] = 0;
        multiIndex[2] = 0;
        break;
      case 1:
        switch(multiIndex[1]){
          case 0:
            multiArray[2] = this.setTimeFn(60,time.m);
            break;
          case (multiArray[1].length-1):
            let em=etime.getMinutes();
            if(etime>0&&em>0){
              multiArray[2] = this.setTimeFn(em,0);
            }else{
              multiArray[2] = this.setTimeFn(60,0);
            }
            break;
          default:
          multiArray[2] = this.setTimeFn(60);
        }
        multiIndex[2] = 0;
        break;
      break;

    }
   console.log(multiArray)
    this.setData({
      multiArray:JSON.parse(JSON.stringify(multiArray)),
      multiIndex,order_id:0
    });
  },
  fwriteDate(AddDayCount){
    var dd = new Date(),stime=this.data.stime;
    if(this.data.bookstart==1){
      dd=new Date(stime*1)
    }
　　dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
　　var y = dd.getFullYear();
　　var m = dd.getMonth()+1;//获取当前月份的日期
　　var d = dd.getDate();
    return y+"/"+m+"/"+d;
  },
  fwriteCurrentDate(){//获取当前时间
    var now = new Date();
    var hour = now.getHours();//得到小时
    var minu = now.getMinutes();//得到分钟
    if (hour < 10) hour = "0" + hour;
    if (minu < 10) minu = "0" + minu;
    let item1={};
    item1.h=hour;
    item1.m=minu;
    return item1
  },
  setTimeFn(num,start,index){
    let arr=[],h=0,m=0;num=num*1;
    for(let i=start?start*1:0;i<num;i++){
      let h=i;
      if(i<10){
        h='0'+h
      }
      arr.push(h)
    }
    return arr
  },
  setmultiArray(){
    let multiArray=[[], ['00'], ['00分']];
    let time=this.fwriteCurrentDate(),etime=new Date(this.data.etime*1),booktime=parseFloat(this.data.booktime),eh=etime.getHours(),em=etime.getMinutes(),now=new Date(),nh=now.getHours(),nm=now.getMinutes();
    if(booktime>0&&eh>0){
      if(eh<nh||(eh==nh&&em<nm)){
        booktime+=1
      }
    }
    for(let i=0;i<=booktime;i++){
      multiArray[0].push(this.fwriteDate(i));
    }
    let isnow=this.isToday(multiArray[0][0])?parseFloat(time.h)+1:0,stime=new Date(this.data.stime*1),h=stime.getHours(),m=stime.getMinutes();
    if(isnow==0){
      multiArray[1]=this.setTimeFn(24,h);
      multiArray[2]=this.setTimeFn(60,m);
    }else{
      if(booktime==1&&eh>0){
        multiArray[1] = this.setTimeFn(em>0?eh*1+1:eh,0);
        multiArray[2] = this.setTimeFn(em,0,1);
      }
      else{
        multiArray[1] = this.setTimeFn(24,parseFloat(time.h*1+1));
        multiArray[2] = this.setTimeFn(60,0);
      }
    }
    console.log(multiArray,40111)
    this.setData({
      multiArray,
    })
  },
  isToday(str){
    str=new Date(str);
    var todaysDate = new Date();
    if(str.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)){
        return true;
    } else {
        return false;
    }
  },
  hideOrderFn(){
    this.setData({
      showorder:false,resetinfo:true,multiArray: [[], [],[]], multiIndex: [0, 0, 0],
    })
    if(this.data.ordermethod>0){
      this.setData({orderinfo:{}})
    }
    this.triggerEvent("hide")
  },
  returnFn(){return false},

  }
})
