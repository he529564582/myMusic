var EventCenter = {
  on: function(type, handler){
    $(document).on(type, handler)
  },
  fire: function(type, data){
    $(document).trigger(type, data)
  }
}


var Footer = {
  init:function(){
    this.$footer = $('footer')
    this.$ul = this.$footer.find('ul')
    this.$box = this.$footer.find('.box')
    this.$rightBtn = this.$footer.find('.icon-right')
    this.$leftBtn = this.$footer.find('.icon-left')
    this.isToEnd = false    //默认没有到结束位置
    this.isToStart = true   //默认是到了开始位置
    this.isAnimate  = false //默认不在当前的动画过程中，多次点击不响应
    this.bind()
    this.render()
  },
  bind:function(){
    var that = this
    this.$rightBtn.on('click',function(){
      if(that.isAnimate) return
      var imgWidth = that.$box.find('li').outerWidth(true)
      var imgCount = Math.floor(that.$box.width()/imgWidth)
      if(!that.isToEnd){        //如果没有滚动到结束位置
        that.isAnimate = true
        that.$ul.animate({
          left: '-='+ imgWidth * imgCount
        },400,function(){
          that.isAnimate = false
          that.isToStart = false
          console.log(that.$box.width())
          console.log(that.$ul.css('left'))
          console.log(that.$ul.css('width'))
          if(parseFloat(that.$box.width()) - parseFloat(that.$ul.css('left')) >= parseFloat(that.$ul.css('width'))){
            that.isToEnd = true //滚动到底部位置
          }
        })
      }
    })
    this.$leftBtn.on('click',function(){
      if(that.isAnimate) return 
      var imgWidth = that.$box.find('li').outerWidth(true)
      var imgCount = Math.floor(that.$box.width()/imgWidth)
      if(!that.isToStart){      //如果没有滚动到开始位置
        that.isAnimate = true
        that.$ul.animate({
          left:'+=' + imgCount * imgWidth
        },400,function(){
          that.isToEnd = false
          that.isAnimate = false
          console.log(that.$box.width())
          console.log(that.$ul.css('left'))
          console.log(that.$ul.css('width'))
          if(parseFloat(that.$ul.css('left')) >= 0){
            that.isToStart = true // 已滚动到开始位置
   
          }
        })
      }
    })
    this.$footer.on('click','li',function(){
      $(this).addClass('active').siblings().removeClass('active')
      EventCenter.fire('select-albumn',{
        channelId :$(this).attr('data-channel-id'),
        channelName :$(this).attr('data-channel-name')
      })  
    })
  },
  render(){
    var that = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getChannels.php').done(function(ret){
      console.log(ret)
      that.renderFooter(ret.channels)
    }).fail(function(){
      console.log('error')
    })
  },
  renderFooter:function(channels){
    console.log(channels)
    var html = ''
    channels.unshift({
      channel_id:0,
      name: 'myMusic',
      cover_small: 'http://cloud.hunger-valley.com/17-10-24/1906806.jpg-small',
      cover_middle: 'http://cloud.hunger-valley.com/17-10-24/1906806.jpg-middle',
      cover_big: 'http://cloud.hunger-valley.com/17-10-24/1906806.jpg-big',
    })
    channels.forEach(function(channel){
      html += '<li data-channel-id='+channel.channel_id+' data-channel-name='+channel.name+'>'
      + '  <div class="cover" style="background-image:url('+channel.cover_small+')"></div>'
      + '  <h3>'+channel.name+'</h3>'
      +'</li>'
    })
    this.$ul.html(html)
    this.setStyle()
  },
  setStyle:function(){
    var count = this.$footer.find('li').length
    var width = this.$footer.find('li').outerWidth(true)
    this.$ul.css({
      width: count * width + 'px'
    })
  }
}





var Fm ={
  init:function(){
    this.bind()
    this.$container = $('.page-music')
    this.audio = new Audio()
    this.audio.autoplay = true
  },
  bind:function(){
    var that = this
    EventCenter.on('select-albumn',function(e,channelObj){
      that.channelId = channelObj.channelId
      that.channelName = channelObj.channelName
      console.log('select',channelObj)
      that.loadMusic(function(){
        that.setMusic()
      })      
    })
    this.$container.find('.btn-play').on('click',function(){
      
    })
  },
  loadMusic(callbcak){
    // console.log('loadMusic.....')
    var that = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{
      channel:this.channelId
    }).done(function(ret){
      that.song = ret['song'][0]
      callbcak()
    })
  },
  setMusic(){
    // console.log('set music...')
    // console.log(this.song)
    this.audio.src = this.song.url
    $('.bg').css('background-image', 'url('+this.song.picture+')')
    this.$container.find('.aside figure').css('background-image', 'url('+this.song.picture+')')
    this.$container.find('.detail h2').text(this.song.title)
    this.$container.find('.detail .author').text(this.song.artist)
    this.$container.find('.tag').text(this.channelName)
    // this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
  }
}
Footer.init()
Fm.init()