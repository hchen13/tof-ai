import * as cocoSsd from '@tensorflow-models/coco-ssd'
import './css/reset.css'

let isResize = false

window.addEventListener(
  'onorientationchange' in window ? 'orientationchange' : 'resize',
  handleResize,
  false
)

function handleResize() {
  if (window.orientation === 180 || window.orientation === 0) {
    isResize = false
  }
  if (window.orientation === 90 || window.orientation === -90) {
    isResize = true
  }
}

let model
let w = document.body.clientWidth
let h = document.body.clientHeight

let vw, vh

const btn = document.getElementById('tap')
const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const iCanvas = document.getElementById('imgCanvas')

btn.addEventListener('click', handleClick)

function handleClick() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const webCamPromise = navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          // width:640,
          // height:480,
          // facingMode: 'user'
          facingMode: 'environment'
        }
      })
      .then(stream => {
        window.stream = stream
        video.srcObject = stream
        let videoTrack = stream.getVideoTracks()[0]
        // console.log(videoTrack)
        // 通过 videotrack 的getsettings 拿到constrants的对象
        let videoConstraints = videoTrack.getSettings()
        document.getElementById('width').innerHTML = JSON.stringify(
          videoConstraints
        )
        console.log(videoConstraints)
        // return;
        // pc 和 移动端 宽高比相反

        //pc
        // vw = videoConstraints.width;
        // vh = videoConstraints.height;

        //移动端

        vh = videoConstraints.width
        vw = videoConstraints.height

        let cacheh

        if (isResize) {
          vw = videoConstraints.width
          vh = videoConstraints.height
          canvas.height = h
          cacheh = h / (vh / vw)
          cavas.width = cacheh
          video.height = h
          video.width = cacheh
        } else {
          canvas.width = w
          cacheh = w / (vw / vh)
          canvas.height = cacheh

          video.width = w
          video.height = cacheh
        }

        document.getElementById('width').innerHTML = vw
        document.getElementById('height').innerHTML = vh
        document.getElementById('cwidth').innerHTML = w
        document.getElementById('cheight').innerHTML = h

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

function renderPredictions(predictions) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)
  // Font options.
  const font = '16px sans-serif'
  ctx.font = font
  ctx.textBaseline = 'top'
  predictions.forEach(prediction => {
    const [x, y, cw, ch] = prediction.bbox
    ctx.strokeStyle = '#00FFFF'
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, cw, ch)
    // Draw the label background.
    ctx.fillStyle = '#00FFFF'
    const textWidth = ctx.measureText(prediction.class).width
    const textHeight = parseInt(font, 10) // base 10
    ctx.fillRect(x, y, textWidth + 1, textHeight + 1)
  })

  predictions.forEach(prediction => {
    const x = prediction.bbox[0]
    const y = prediction.bbox[1]
    ctx.fillStyle = '#000000'
    ctx.fillText(prediction.class, x, y)
  })
}
