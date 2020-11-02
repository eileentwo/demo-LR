// components/list/list.js
Component({
  /**
   * 组件的属性列表
   */
  lifetimes: {
    ready: function () {
      let arr = [];
      //console.log("ready",this.data.contentList)
      //获取所有的标题 距离顶部的距离 把其存放到一个数组中去
      this.createSelectorQuery().selectAll(".content").boundingClientRect((rect) => {
        //加了定时器就能获取到
        //这个周期有bug只会执行一次  然后数据初次请求过来的
        //解决方案  在父组件中传这个数组的时候判断一下是不是空数组
        //console.log(rect, "---")
        rect.forEach(item => {
          arr.push(item.top)
        })

        //将arr赋值到全局data上面
        this.setData({
          saveTitle: arr
        }, () => {
          console.log(this.data.saveTitle)
        })

      }).exec((res) => {
      })

    },
    attached: function () {
      // 在组件实例进入页面节点树时执行

      //在这里打印data的时候  properties也属于data的变量
      //console.log("attached", this.data.saveTitle)





    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行

    }
  },
  properties: {
    contentList: Array,
    currentKey: String
  },
  /**
   * 组件的初始数据
   */
  data: {
    //定义组件自己的变量
    saveTitle: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleScroll(e) {
      let event = e;
      //这个函数只要页面发生滑动就会触发  是通过人家的组件实现的
      this.data.saveTitle.forEach((item, index) => {
        let elTop = event.detail.scrollTop;
        if (elTop >=item&&elTop<this.data.saveTitle[index+1]) {
          console.log(elTop,item,index,this.data.saveTitle)
          this.triggerEvent('ChangeId', {
            id: index
          })
        }
      })
    }
  }
})
