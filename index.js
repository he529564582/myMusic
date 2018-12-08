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
    this.$container = $('#page-music')
    this.audio = new Audio()
    this.audio.autoplay = true
    this.bind()
  },
  bind: function(){
    var that = this
    EventCenter.on('select-albumn', function(e, channelObj){
      console.log('select ', channelObj)
      that.channelId = channelObj.channelId
      that.channelName = channelObj.channelName
      that.loadMusic(function(){
        that.setMusic()
      })
    })
    //暂停&播放
    this.$container.find('.btn-play').on('click', function(){
      var $btn = $(this)
      if($btn.hasClass('icon-pause')){
        $btn.removeClass('icon-pause').addClass('icon-play')
        that.audio.pause()
      }else{
        $btn.removeClass('icon-play').addClass('icon-pause')
        that.audio.play()
      }
    })
    //下一曲
    this.$container.find('.btn-next').on('click',function(){
      that.loadMusic(function(){
        that.setMusic()
      })
    })
    //
    this.audio.addEventListener('play',function(){
      // console.log('play')
      clearInterval(that.statusClock)
      that.statusClock = setInterval(function(){
        that.updataStatus()
      },1000)
    })
    this.audio.addEventListener('pause',function(){
      clearInterval(that.statusClock)
      // console.log('pause')
    })
  },
  //加载音乐
  loadMusic(){
    // console.log('loadMusic...')
    var that = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel:this.channelId})
      .done(function(ret){
        console.log(ret)
        that.song = ret['song'][0]
        that.setMusic()
        that.loadLyric()
    })
  },
  //设置歌词(分割歌词)
  loadLyric(){
    var that = this
    $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php',{sid:this.song.sid})
      .done(function(ret){
        // console.log(ret.lyric)
        var lyric = ret.lyric
        var lyricObj = {}
        lyric.split('\n').forEach(function(line){
          var times = line.match(/\d{2}:\d{2}/g)     //定义歌曲时间
          var str = line.replace(/\[.+?\]/g,'')      //定义歌词内容
          if(Array.isArray(times)){         // timer在匹配的过程中有可能不是一个数组，有些行是空字符串，空格
            times.forEach(function(time){
              lyricObj[time] = str
            })
          }
        })
        that.lyricObj = lyricObj
        // console.log(lyricObj)
    })
  },
  // 设置页面背景图、标题、作者、标签、初始化页面播放
  setMusic(){
    console.log(this.song)
    this.audio.src = this.song.url
    $('.bg').css('background-image', 'url('+this.song.picture+')')
    this.$container.find('.aside figure').css('background-image', 'url('+this.song.picture+')')
    this.$container.find('.detail h2').text(this.song.title)
    this.$container.find('.detail .author').text(this.song.artist)
    this.$container.find('.tag').text(this.channelName)
    this.$container.find('.btn-play').removeClass('icon-play').addClass('icon-pause')
  },
    
  updataStatus(){
    //设置歌曲时间
    var min = Math.floor(this.audio.currentTime/60) + ''
    var sec = Math.floor(this.audio.currentTime%60) + ''
    sec = sec.length === 2?sec:'0'+ sec
    this.$container.find('.current-time').text(min+':'+sec)
    //设置歌曲进度条
    this.$container.find('.bar-progress').css('width',this.audio.currentTime / this.audio.duration * 100 + '%')
    // 设置每行歌词显示
    // console.log(this.lyricObj['0' + min +':'+ sec])
    var line =this.lyricObj['0' + min +':'+ sec]
    if(line){
      this.$container.find('.lyric p').text(line).boomText()
    }
  }
}
//设置歌词滚动样式
$.fn.boomText = function(type){
  type = type || 'fadeOutLeftBig'
  // console.log(type)
  this.html(function(){
    var arr = $(this).text()
    .split('').map(function(word){
        return '<span dispaly:"inline-block;opacity = 0">'+ word + '</span>'
    })
    return arr.join('')
  })
  var index = 0
  var $boomTexts = $(this).find('span')
  var clock = setInterval(function(){
    $boomTexts.eq(index).addClass('animated ' + type)
    index++
    if(index >= $boomTexts.length){
      clearInterval(clock)
    }
  }, 300)
}
$('p').boomText('fadeOutLeftBig')


Footer.init()
Fm.init()
