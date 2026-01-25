import { ref, reactive } from 'vue'
import * as THREE from 'three'

export function useCubicMode() {
  const colors = ['#007aff', '#ff9500', '#1c1c1e', '#ffffff']
  const selectedColor = ref('#007aff')
  const isDeleteMode = ref(false)
  const isSliceMode = ref(false)
  const currentView = ref('iso')

  const sliceConfig = reactive({
    x: 0,
    y: 1,
    z: 0,
    constant: 5
  })

  let scene = null
  let camera = null
  let renderer = null
  let raycaster = null
  let mouse = null
  let ground = null
  let cubes = []
  let clippingPlane = null
  let animationId = null

  function initThree() {
    const container = document.getElementById('three-container')
    if (!container) return

    // 清理旧的
    cleanup()

    const w = container.clientWidth
    const h = container.clientHeight

    // 场景
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f7)

    // 正交相机
    const aspect = w / h
    const d = 10
    camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000)
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.localClippingEnabled = true
    container.appendChild(renderer.domElement)

    // 光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    scene.add(directionalLight)

    // 地面
    const groundGeo = new THREE.PlaneGeometry(20, 20)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      side: THREE.DoubleSide
    })
    ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.01
    ground.name = 'ground'
    scene.add(ground)

    // 网格辅助线
    const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xdddddd)
    scene.add(gridHelper)

    // 切面
    clippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 5)

    // 射线
    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    // 事件
    container.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onResize)

    // 渲染循环
    function animate() {
      animationId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()
  }

  function onPointerDown(event) {
    const container = document.getElementById('three-container')
    if (!container || !renderer) return

    const rect = container.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    // 检测交叉
    const allObjects = [ground, ...cubes]
    const intersects = raycaster.intersectObjects(allObjects)

    if (intersects.length > 0) {
      const hit = intersects[0]
      const obj = hit.object

      if (isDeleteMode.value) {
        // 删除模式
        if (obj.name === 'cube') {
          scene.remove(obj)
          cubes = cubes.filter(c => c !== obj)
        }
      } else {
        // 放置模式
        let pos = new THREE.Vector3()

        if (obj.name === 'ground') {
          // 点击地面
          pos.copy(hit.point)
          pos.x = Math.floor(pos.x) + 0.5
          pos.z = Math.floor(pos.z) + 0.5
          pos.y = 0.5
        } else if (obj.name === 'cube') {
          // 点击方块，在其上方放置
          pos.copy(hit.point)
          pos.add(hit.face.normal.multiplyScalar(0.5))
          pos.x = Math.floor(pos.x) + 0.5
          pos.y = Math.floor(pos.y) + 0.5
          pos.z = Math.floor(pos.z) + 0.5
        }

        // 检查是否已有方块
        const exists = cubes.some(c =>
          Math.abs(c.position.x - pos.x) < 0.1 &&
          Math.abs(c.position.y - pos.y) < 0.1 &&
          Math.abs(c.position.z - pos.z) < 0.1
        )

        if (!exists && pos.y > 0) {
          addCube(pos.x, pos.y, pos.z, selectedColor.value)
        }
      }
    }
  }

  function addCube(x, y, z, color) {
    const geo = new THREE.BoxGeometry(0.95, 0.95, 0.95)
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      clippingPlanes: isSliceMode.value ? [clippingPlane] : []
    })
    const cube = new THREE.Mesh(geo, mat)
    cube.position.set(x, y, z)
    cube.name = 'cube'
    scene.add(cube)
    cubes.push(cube)
  }

  function onResize() {
    const container = document.getElementById('three-container')
    if (!container || !camera || !renderer) return

    const w = container.clientWidth
    const h = container.clientHeight
    const aspect = w / h
    const d = 10

    camera.left = -d * aspect
    camera.right = d * aspect
    camera.top = d
    camera.bottom = -d
    camera.updateProjectionMatrix()

    renderer.setSize(w, h)
  }

  function switchColor(c) {
    selectedColor.value = c
    isDeleteMode.value = false
  }

  function toggleDeleteMode() {
    isDeleteMode.value = !isDeleteMode.value
  }

  function toggleSliceMode() {
    isSliceMode.value = !isSliceMode.value
    updateCubeClipping()
  }

  function updateCubeClipping() {
    cubes.forEach(cube => {
      cube.material.clippingPlanes = isSliceMode.value ? [clippingPlane] : []
      cube.material.needsUpdate = true
    })
  }

  function updateSlicePlane() {
    if (clippingPlane) {
      clippingPlane.normal.set(sliceConfig.x, sliceConfig.y, sliceConfig.z).normalize()
      clippingPlane.constant = -sliceConfig.constant
    }
  }

  function resetSlice() {
    sliceConfig.x = 0
    sliceConfig.y = 1
    sliceConfig.z = 0
    sliceConfig.constant = 5
    updateSlicePlane()
  }

  function clearCubes() {
    cubes.forEach(cube => scene.remove(cube))
    cubes = []
  }

  function setCameraView(view) {
    currentView.value = view
    if (!camera) return

    const d = 20
    const positions = {
      front: [0, 5, d],
      back: [0, 5, -d],
      left: [-d, 5, 0],
      right: [d, 5, 0],
      top: [0, d, 0.01],
      iso: [15, 15, 15]
    }

    const pos = positions[view] || positions.iso
    camera.position.set(...pos)
    camera.lookAt(0, 0, 0)
  }

  function cleanup() {
    const container = document.getElementById('three-container')

    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }

    if (container) {
      container.removeEventListener('pointerdown', onPointerDown)
    }
    window.removeEventListener('resize', onResize)

    if (renderer && container) {
      container.removeChild(renderer.domElement)
      renderer.dispose()
    }

    cubes = []
    scene = null
    camera = null
    renderer = null
    raycaster = null
    mouse = null
    ground = null
    clippingPlane = null
  }

  return {
    colors,
    selectedColor,
    isDeleteMode,
    isSliceMode,
    sliceConfig,
    currentView,
    initThree,
    switchColor,
    toggleDeleteMode,
    toggleSliceMode,
    updateSlicePlane,
    resetSlice,
    clearCubes,
    setCameraView,
    cleanup
  }
}
