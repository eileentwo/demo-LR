多级子菜单使用：
html:
<view wx:if="{{list.length>0}}">
  <block wx:for="{{list}}" wx:key="index">
    <mytree model='{{ item }}' bind:tapitem='tapItem' showAdd="{{showAdd}}" showRadio="{{showRadio}}"></mytree>
  </block>
</view>
JS方法：
  //事件处理函数
  tapItem: function (e) {
    console.log('index接收到的itemid: ' + e.detail.itemid, 'showBox：' + e.detail.showBox);
    let itemid = e.detail.itemid;
    let itemname = e.detail.itemname;
    let level = e.detail.itemlevel;
    let list = this.data.list;
    let index = this.data.index;
    let showBox = e.detail.showBox;
    if (!showBox) {
      this.setPrevPage(index, itemname, itemid);
      return;
    }
    this.setData({
      list, showBox, level, itemid,itemname
    })
  },
//楼层联动主页面例子page中的list
