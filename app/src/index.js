import * as cocoSsd from '@tensorflow-models/coco-ssd'
import './css/reset.css'

window.onload = documentLoad


function documentLoad(){

  const  getId=dom=>document.getElementById(dom);

  let isCamera = false;
  let isResize = false;
  let w,
      h;

  let vw,vh;


  const btn = getId('tap');
  const content = getId('content');
  const msgDom = getId('msg');
  const video  = getId('video');
  const canvas = getId('canvas');
  const msg = getId('msgContent');


  // document.fullscreen;
  let isFullscreen = document.fullscreen;

  function fullScreen(el){
    var el = document.documentElement
    var rfs =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullscreen ||
      el.msRequestFullscreen
    if (typeof rfs != 'undefined' && rfs) {
      rfs.call(el)
      isFullscreen = true
      w = document.body.clientWidth,
      h = document.body.clientHeight + 30;
      // alert(w);
      // alert(h);
      handleClick();
    }
  }

  function exitScreen(){
    var exitMethod =
      document.exitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitExitFullscreen ||
      document.webkitExitFullscreen
    if (exitMethod) {
      exitMethod.call(document)
      isFullscreen = false
    }
  }

  window.addEventListener(
    'orientationChange' in window ? 'orientationchange' : 'resize',
    handleResize,
    false
  )

  btn.addEventListener('click',()=>{
    if(isFullscreen){
      // exitScreen()
    } else {
      fullScreen()
    }
  })

  function handleClick(){
    if(isCamera) return;
    isCamera =true;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            // facingMode: 'user'
            facingMode: 'environment'
          }
        })
        .then(stream => {
          video.srcObject = stream
          // console.log(stream,video)  
          let videoTrack = stream.getVideoTracks()[0]
          let videoConstraints = videoTrack.getSettings()

          vh = videoConstraints.width
          vw = videoConstraints.height
  
          let cacheh
        if (isResize) {
  
          vw = videoConstraints.width
          vh = videoConstraints.height

          canvas.height = h
          cacheh = h / (vh / vw)
          canvas.width = cacheh
          video.height = h
          video.width = cacheh
          content.style.width = cacheh + 'px';
          content.style.height = h + 'px';

          msgDom.style.width = w - cacheh + 'px';
          msgDom.style.height = h + 'px';
          msgDom.style.left = cacheh + 'px';
          msgDom.style.top = 0;

        } else {

          canvas.width = w
          cacheh = w / (vw / vh)
          canvas.height = cacheh

          video.width = w
          video.height = cacheh
          content.style.width = w + 'px';
          content.style.height = cacheh + 'px';

          msgDom.style.width = w + 'px';
          msgDom.style.height = h - cacheh + 'px';
          msgDom.style.left = cacheh + 'px';
          msgDom.style.top = cacheh + 'px';

        }
        var w1 = document.body.clientWidth;
        var h1  = document.body.clientHeight;

        msg.innerHTML = w + '...' + h + ' ..' + w1 + '.'+ h1
        return new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            resolve()
          }
        })
      })
    const modelPromise = cocoSsd.load()

    Promise.all([modelPromise, webCamPromise])
      .then(values => {
        detectFrame(video, values[0])
      })
      .catch(error => {
        console.error(error)
      })
    }
  }

  function detectFrame(video, model) {

    model.detect(video).then(predictions => {

      renderPredictions(predictions)

      requestAnimationFrame(() => {
        detectFrame(video, model)
      })
    })
  }



  function handleResize() {
    if (window.orientation === 180 || window.orientation === 0) {
      isResize = false
    }
    if (window.orientation === 90 || window.orientation === -90) {
      isResize = true
    }
  }

  function renderPredictions(predictions) {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)
    // Font options.
    const font = '16px sans-serif'
    ctx.font = font
    ctx.textBaseline = 'top'
    predictions.forEach(prediction => {

      const [x, y, cw, ch] = prediction.bbox;
      ctx.strokeStyle = '#00FFFF'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, cw, ch)
      // Draw the label background.
      ctx.fillStyle = '#00FFFF'
      const textWidth = ctx.measureText(prediction.class).width
      const textHeight = parseInt(font, 10) // base 10
      ctx.fillRect(x, y, textWidth + 1, textHeight + 1)
      ctx.fillStyle = '#000000'
      ctx.fillText(prediction.class, x, y)

    })
  }
  




  handleResize();


}






// let isResize = false

// window.addEventListener(
//   'orientationChange' in window ? 'orientationchange' : 'resize',
//   handleResize,
//   false
// )

// handleResize();

// // alert('onorientationChange' in window);
// function handleResize() {
//   if (window.orientation === 180 || window.orientation === 0) {
//     isResize = false
//     // console.log('1')
//   }
//   if (window.orientation === 90 || window.orientation === -90) {
//     isResize = true
//     // console.log('2')
//   }
// }

// let model
// let w = document.body.clientWidth
// let h = document.body.clientHeight


// let vw, vh

// const btn = document.getElementById('tap')
// const video = document.getElementById('video')
// const canvas = document.getElementById('canvas')
// const iCanvas = document.getElementById('imgCanvas')

// btn.addEventListener('click', handleClick)

// function handleClick() {
//   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//     const webCamPromise = navigator.mediaDevices
//       .getUserMedia({
//         audio: false,
//         video: {
//           // width:640,
//           // height:480,
//           // facingMode: 'user'
//           facingMode: 'environment'
//         }
//       })
//       .then(stream => {
//         window.stream = stream
//         video.srcObject = stream
//         let videoTrack = stream.getVideoTracks()[0]
//         // console.log(videoTrack)
//         // 通过 videotrack 的getsettings 拿到constrants的对象
//         let videoConstraints = videoTrack.getSettings()
//         document.getElementById('width').innerHTML = JSON.stringify(
//           videoConstraints
//         )
//         // return;
//         // pc 和 移动端 宽高比相反

//         //pc
//         // vw = videoConstraints.width;
//         // vh = videoConstraints.height;

//         //移动端

//         vh = videoConstraints.width
//         vw = videoConstraints.height

//         let cacheh
//         if (isResize) {

//           vw = videoConstraints.width
//           vh = videoConstraints.height
//           // console.log(h,vh,vw)
//           canvas.height = h
//           cacheh = h / (vh / vw)
//           canvas.width = cacheh
//           video.height = h
//           video.width = cacheh

//         } else {

//           canvas.width = w
//           cacheh = w / (vw / vh)
//           canvas.height = cacheh

//           video.width = w
//           video.height = cacheh

//         }

//         document.getElementById('width').innerHTML = vw
//         document.getElementById('height').innerHTML = vh
//         document.getElementById('cwidth').innerHTML = w
//         document.getElementById('cheight').innerHTML = h
//         return new Promise((resolve, reject) => {
//           video.onloadedmetadata = () => {
//             resolve()
//           }
//         })
//       })
//     const modelPromise = cocoSsd.load()
//     Promise.all([modelPromise, webCamPromise])
//       .then(values => {
//         // console.log(345);
//         detectFrame(img, values[0])
//       })
//       .catch(error => {
//         console.error(error)
//       })
//   }
// }

// function detectFrame(video, model) {
//   // console.log(img)
//   i++;
//   if (i>30) {
//     cancelAnimationFrame(detectFrame);
//   }

  

//   model.detect(video).then(predictions => {
//     renderPredictions(predictions)

  
//   var h5=document.createElement("h5");
//   h5.innerHTML = video.width + ''+ video.height;
//   aa.appendChild(h5)
//     // console.log(video.width, video.height);
//     requestAnimationFrame(() => {
//       detectFrame(video, model)
//     })
//   })
// }

// var aa  =document.getElementById('demo');
// function renderPredictions(predictions) {
//   const ctx = canvas.getContext('2d')
//   ctx.clearRect(0, 0, w, h)
//   // Font options.
//   const font = '16px sans-serif'
//   ctx.font = font
//   ctx.textBaseline = 'top'
//   predictions.forEach(prediction => {
//     // console.log(prediction)
//     // if (prediction.score < .8) return 
//     const [x, y, cw, ch] = prediction.bbox;
//     var p=document.createElement("p");
//     p.innerHTML = parseInt(x) + ',' + parseInt(y) + ',' + parseInt(cw) + ',' + parseInt(ch) + ','
//     aa.appendChild(p)
//     ctx.strokeStyle = '#00FFFF'
//     ctx.lineWidth = 1
//     ctx.strokeRect(x, y, cw, ch)
//     // Draw the label background.
//     ctx.fillStyle = '#00FFFF'
//     const textWidth = ctx.measureText(prediction.class).width
//     const textHeight = parseInt(font, 10) // base 10
//     ctx.fillRect(x, y, textWidth + 1, textHeight + 1)
//   })

//   predictions.forEach(prediction => {
//     // if (prediction.score < .8) return 
//     const x = prediction.bbox[0]
//     const y = prediction.bbox[1]
//     ctx.fillStyle = '#000000'
//     ctx.fillText(prediction.class, x, y)
//   })
// }
