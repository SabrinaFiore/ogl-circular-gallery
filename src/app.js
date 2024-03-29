import { Camera, Renderer, Transform, Plane } from "ogl-typescript"

import Image1 from '../src/images/1.jpg'
import Image2 from '../src/images/2.jpg'
import Image3 from '../src/images/3.jpg'
import Image4 from '../src/images/4.jpg'
import Image5 from '../src/images/5.jpg'
import Image6 from '../src/images/6.jpg'
import Image7 from '../src/images/7.jpg'
import Image8 from '../src/images/8.jpg'
import Image9 from '../src/images/9.jpg'
import Image10 from '../src/images/10.jpg'

import { lerp } from '../src/utils/math'
import Media from '../src/media'
import normalizeWheel from "normalize-wheel"
import { debounce } from "lodash"
// import Box from '../src/box'

export default class App {
  constructor () {
    document.documentElement.classList.remove('no-js')

    this.scroll = {
      ease: 0.05,
      current: 0,
      target: 0,
      last: 0
    }

    this.onCheckDebounce = debounce(this.onCheck, 200)
    console.log("[debug] this.onCheckDebounce", this.onCheckDebounce)

    this.createRenderer()
    this.createCamera()
    this.createScene()
    this.onResize()
    this.createGeometry()
    this.createMedias()
    this.createBackground()
    this.update()
    this.addEventListeners()
    this.createPreloader()
  }

  createPreloader () {
    Array.from(this.mediasImages).forEach(({ image: source, text: text }) => {
      const image = new Image()
      this.loaded = 0
      image.src = source
      image.onload = _ => {
        this.loaded += 1
        if (this.loaded === this.mediasImages.length) {
          document.documentElement.classList.remove('loading')
          document.documentElement.classList.add('loaded')
        }
      }
    })
  }

  createRenderer () {
    this.renderer = new Renderer()
    this.gl = this.renderer.gl
    this.gl.clearColor(0.79607843137, 0.79215686274, 0.74117647058, 1)
    document.body.appendChild(this.gl.canvas)
  }

  createCamera () {
    this.camera = new Camera(this.gl)
    this.camera.fov = 45
    this.camera.position.z = 20
  }

  createScene () {
    this.scene = new Transform()
  }

  createGeometry () {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    })
  }

  createMedias () {
    this.mediasImages = [
      { image: Image1, text: 'New Synagogue' },
      { image: Image2, text: 'Paro Taktsang' },
      { image: Image3, text: 'Petra' },
      { image: Image4, text: 'Gooderham Building' },
      { image: Image5, text: 'Catherine Palace' },
      { image: Image6, text: 'Sheikh Zayed Mosque' },
      { image: Image7, text: 'Madonna Corona' },
      { image: Image8, text: 'Plaza de Espana' },
      { image: Image9, text: 'Saint Martin' },
      { image: Image10, text: 'Tugela Falls' },
    ]

    this.medias = this.mediasImages.map(({ image, text }, index) => {
      const media = new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: text,
        viewport: this.viewport
      })

      // document.getElementById('searchTxt').addEventListener('change', function() {
      //   const input = document.getElementById('searchTxt')
      //   console.log("[debug] input.value", input.value)
  
      //   if (input.value !== text) {
      //     // media.scene.visible = false
      //     console.log("[debug] media", media)
      //   }
        
      //   if (input.value === '' || input.value === text) {
      //     media.scene.visible = true
          
      //     if (input.value === text && media.scene.visible === true) {
      //       // console.log("[debug] ENTRA media.plane.rotation", media.plane.rotation)
      //       // media.plane.position.set(0, -1.3, 0)
      //     }
      //   }
      // }, false)  

      return media
    })

    console.log("[debug] this.medias", this.medias)
  }

  createBackground () {
    // this.background = new Background({
    //   gl: this.gl,
    //   scene: this.scene,
    //   viewport: this.viewport
    // })
  }

  /**
   * Events.
   */
  onTouchDown (event) {
    this.isDown = true
    this.scroll.position = this.scroll.current
    this.start = event.touches ? event.touches[0].clientX : event.clientX
  }

  onTouchMove (event) {
    if (!this.isDown) return
    const x = event.touches ? event.touches[0].clientX : event.clientX
    const distance = (this.start - x) * 0.01
    this.scroll.target = this.scroll.position + distance
  }

  onTouchUp (event) {
    this.isDown = false
    this.onCheck()
  }

  onWheel (event) {
    const normalized = normalizeWheel(event)
    const speed = normalized.pixelY
    this.scroll.target += speed * 0.005
    this.onCheckDebounce()
  }

  onCheck () {
    const { width } = this.medias[0]
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width)
    console.log("[debug] itemIndex", itemIndex)
    const item = width * itemIndex
    console.log("[debug] item", item)

    if (this.scroll.target < 0) {
      this.scroll.target = -item
    } else {
      this.scroll.target = item
    }
  }

  /**
   * Resize.
   */
  onResize () {
    this.screen = {
      height: window.innerHeight,
      width: window.innerWidth
    }

    this.renderer.setSize(this.screen.width, this.screen.height)

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height
    })

    const fov = this.camera.fov * (Math.PI / 180)
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    const width = height * this.camera.aspect

    this.viewport = {
      height,
      width
    }

    if (this.medias) {
      this.medias.forEach(media => media.onResize({
        screen: this.screen,
        viewport: this.viewport
      }))
    }
  }

  /**
   * Update.
   */
  update () {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease)

    if (this.scroll.current > this.scroll.last) {
      this.direction = 'right'
    } else {
      this.direction = 'left'
    }

    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, this.direction))
    }

    if (this.background) {
      this.background.update(this.scroll, this.direction)
    }

    this.renderer.render({
      scene: this.scene,
      camera: this.camera
    })

    this.scroll.last = this.scroll.current

    window.requestAnimationFrame(this.update.bind(this))
  }

  /**
   * Listeners.
   */
  addEventListeners () {
    window.addEventListener('resize', this.onResize.bind(this))
    window.addEventListener('mousewheel', this.onWheel.bind(this))
    window.addEventListener('wheel', this.onWheel.bind(this))
    window.addEventListener('mousedown', this.onTouchDown.bind(this))
    window.addEventListener('mousemove', this.onTouchMove.bind(this))
    window.addEventListener('mouseup', this.onTouchUp.bind(this))
    window.addEventListener('touchstart', this.onTouchDown.bind(this))
    window.addEventListener('touchmove', this.onTouchMove.bind(this))
    window.addEventListener('touchend', this.onTouchUp.bind(this))
  }
}

new App()