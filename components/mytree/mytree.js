// pages/components/mytree/mytree.js

Component({
  properties: {
    model: {
      type: Object,
      observer: function (res) {
        // console.log(res, 999)
        let timer = setTimeout(() => {
          this.setBranch()
            clearTimeout(timer)
          }, 100)
       
      }
    },
    showAdd:Boolean,
    hideStree:{
      type:Boolean
    },
    showRadio: Boolean
  },
  data: {
    open: false,
    isBranch: false,
    radioChecked:false,
    showBox:false
  },

  methods: {
    toggle: function (e) {
      if (this.data.isBranch) {
        
        this.setData({
          open: !this.data.open, 
        })
      }
    },
    tapItem: function (e) {
      console.log(e,39)
      var itemid = e.currentTarget.dataset.itemid;
      var itemname = e.currentTarget.dataset.name;
      var itemlevel = e.currentTarget.dataset.level;
      let showBox = this.data.showBox;
      console.log('组件里点击的id: ' + itemid + itemname + itemlevel);
      
      this.triggerEvent('tapitem', { itemid: itemid, itemname: itemname, itemlevel, showBox}, { bubbles: true, composed: true });
    },
    setBranch(){

      if (this.properties.model && this.properties.model.category_id) {
        let isBranch = false;
        isBranch = Boolean(this.data.model&&this.data.model.child_list && this.data.model.child_list.length);
      
        this.setData({
          isBranch, 
        });
      }
    },
   
    _showAddFn(e) {
      this.setData({
        showBox: true
      })
      this.tapItem(e);
    },
  },
  attached(e){
  },
  ready: function (e) {
    console.log(this.data, 50, this.properties)
    if (this.properties.model && this.properties.model.category_id) {
      console.log(51)
      this.setBranch()
    } else {
      let timer = setTimeout(() => {
        this.setBranch();
        clearTimeout(timer)
      }, 300)
    }
  },
})