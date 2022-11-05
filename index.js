
class Canvas {

  constructor(){
    this.width = window.innerWidth
    this.height = window.innerHeight
  }

  get width(){
    return this._width
  }

  set width(value){
    if(value>window.innerWidth || value<0) return
    this._width = value
  }

  get height(){
    return this._height
  }

  set height(value){
    if(value>window.innerHeight || value<0) return
    this._height = value
  }
  
  get canvas(){
    return this._canvas
  }
  
  set canvas(value){
    if(!this._canvas)
    this._canvas = value
  }

  get ctx(){
    return this._ctx
  }

  set ctx(value){
    if(!this._ctx)
    this._ctx = value
  }

  initCanvas(){
    this.canvas = document.createElement('canvas')
    document.body.appendChild(this.canvas)
    this.ctx = this.canvas.getContext("2d");
    this.canvas.setAttribute('width', this.width);
    this.canvas.setAttribute('height', this.height);
  }

}



class VideoCanvas extends Canvas {
  static instances = new Set();

  constructor(videoSrc){
    super()
    this.videoSrc = videoSrc
  }

  get video(){
    return this._video
  }

  set video(value){
    if(!this._video)
    this._video = value
  }

  get paused(){
    return this._paused
  }

  set paused(value){
    this._paused = value
    value ? this.video.pause()  : this.video.play()
    this.initControls()
  }

  get showControls(){
    return this._showControls
  }

  set showControls(value){
    this._showControls = value
    this.canvasCallback()
  }
  
  init(){
    if(VideoCanvas.instances.has(this)){
      this.destroy()
    }
    this.initCanvas()
    this.canvas.addEventListener('mouseenter', () => this.showControls = true)
    this.canvas.addEventListener('mouseleave', () => this.showControls = false)
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e))
    this.initVideo()
    this.initControls()
    VideoCanvas.instances.add(this)
    VideoCanvas.instances.forEach((instance)=>instance._notify())
  }

  _notify(){
    const count = VideoCanvas.instances.size;
    this.width = window.innerWidth / count
    this.canvas.setAttribute('width', window.innerWidth / VideoCanvas.instances.size)
    this.initControls()
    this.canvasCallback()
  }

  destroy(){
    this.video.remove()
    this.canvas.remove()
    VideoCanvas.instances.delete(this)
  }

  initVideo(){
    this.video = document.createElement('video')
    document.body.appendChild(this.video)
    this.video.src = this.videoSrc;
    this.video.autoplay = true;
    this.video.controls = true;
    this.video.muted = true; // important browser may not autoplay unmuted video
    this.video.height = 0;
    this.video.addEventListener("play", ()=>this.canvasCallback(), false);
    this.video.addEventListener("seeked", ()=>this.canvasCallback(), false);
  }

  initControls(){
    const self = this
    this.controls = [
      {
        cX: self.width/2-100,
        cY: self.height - 50,
        r: 40,
        label: '-10',
        onClick(){
          self.video.currentTime -= 10 
        }
      },
      {
        cX: self.width/2,
        cY: self.height - 50,
        r: 40,
        label: self.paused ? 'play' : 'pause',
        onClick(){
          self.paused = !self.paused 
        }
      },
      {
        cX: self.width/2+100,
        cY: self.height - 50,
        r: 40,
        label: '+10',
        onClick(){
          self.video.currentTime += 10 
        }
      }
    ]
  }

  handleCanvasClick(e){
    const clickedX = e.clientX - this.canvas.offsetLeft
    const clickedY = e.clientY - this.canvas.offsetTop
    this.controls.forEach((item)=>{
      if((clickedX - item.cX)**2 + (clickedY - item.cY)**2 < item.r**2){
        item.onClick();
      }
    })
  }

  canvasCallback() {
    this.drawFrame()
    this.showControls && this.drawControls()
    if (!this.video.paused && !this.video.ended) {
      setTimeout(()=>this.canvasCallback(), 0);
    }
  }
  
  drawFrame(){
    this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
  }

  drawControls() {
    const self = this
    this.controls.forEach(item=>{
      self.ctx.beginPath();
      self.ctx.arc(item.cX, item.cY, item.r, 0, 2 * Math.PI);
      self.ctx.fillStyle = "#fff";
      self.ctx.fill();
      self.ctx.font = "20px Arial";
      self.ctx.textAlign = "center";
      self.ctx.textBaseline = "middle";
      self.ctx.fillStyle = "#000"
      self.ctx.fillText(item.label, item.cX, item.cY);
    })
  }

}

document.addEventListener("DOMContentLoaded", () => {
  const instances = [
    new VideoCanvas('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
    new VideoCanvas('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
    new VideoCanvas('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'),
    // new VideoCanvas('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'),
  ]
  
  instances.forEach((instance, i)=>{
    setTimeout(()=>instance.init(), i*30000)
  })

});