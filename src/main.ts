import AppInstance from "src/components/Version/index"
import { getParameterByName } from "./Utils"
import { Refs, Version } from "./const"
import Progress from "Src/components/Progress"
import { Delay } from "./factory/functions"

let App: AppInstance
const version = getParameterByName("version") || VERSION

class Http {
  static _ins: Http
  static get instance(): Http {
    return this._ins || new Http()
  }
  constructor() {
    Http._ins = this
  }
  private serverAddress = location.host === "sdk-de.pocketgamesol.com" ? "http://start-de-sdk.pocketgamesol.com" : SERVER
  private request(param: any): Promise<any> {
    var data
    if (param.data) {
      data = Object.keys(param.data)
        .map(key => {
          return `${key}=${param.data[key]}`
        })
        .join("&")
    }
    var xhr = new XMLHttpRequest()
    xhr.open(param.method, this.serverAddress + param.route)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    xhr.send(data)
    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const json = JSON.parse(xhr.responseText)
            resolve(json)
          } else {
            reject("server res err")
          }
        }
      }
    })
  }
  public post(param: any): Promise<any> {
    return this.request(Object.assign({ method: "POST" }, param))
  }
  public get(param?: any) {
    return this.request(Object.assign({ method: "GET" }, param || {}))
  }
}

class Polyfill {
  constructor() {
    this.setup()
  }
  polyfills = ["Promise", "Set", "Map", "Object.assign"]
  polyfillUrl = "https://polyfill.io/v3/polyfill.min.js"
  features = []
  setup() {
    this.polyfills.forEach(feature => {
      if (!(feature in window)) {
        this.features.push(feature)
      }
    })
    if (this.features.length) {
      var s = document.createElement("script")
      s.src = `${this.polyfillUrl}?features=${this.features.join(",")}&flags=gated,always&rum=0` // &callback=Main
      s.async = true
      document.head.appendChild(s)
      s.onload = function () {
        window.Main()
      }
      s.onerror = function () {
        import("./pollyfills.js").then(function () {
          window.Main()
        })
      }
    } else {
      window.Main()
    }
  }
}

Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))
  return fmt
}

window.Main = async function (adapter = null) {
  if (!window.JsToNative) adapter = await import("./adapter")
  const startKey = getParameterByName("startKey")
  const startId = getParameterByName("startId")
  const globalInit = function () {
    window.overwrite = {} as any
    window.overwrite.getDeviceMsg = function () {
      let msg = window.JsToNative.getDeviceMsg()
      console.info("Js_To_Native::getDeviceMsg", msg)
      return JSON.parse(msg)
    }
    window.overwrite.startLoad = function (param) {
      console.info("Js_To_Native::startLoad", param)
      window.JsToNative.startLoad(JSON.stringify(param))
    }
    window.overwrite.checkVaStatus = function (param) {
      console.info("Js_To_Native::checkVaStatus", param)
      return JSON.parse(window.JsToNative.checkVaStatus(JSON.stringify(param)))
    }
    window.overwrite.plinst = function (param) {
      console.info("Js_To_Native::plinst", param)
      window.JsToNative.plinst(JSON.stringify(param))
    }
    window.overwrite.replinst = function (param) {
      console.info("Js_To_Native::replinst", param)
      window.JsToNative.replinst(JSON.stringify(param))
    }
    window.overwrite.lachgm = function (param) {
      console.info("Js_To_Native::lachgm", param)
      window.JsToNative.lachgm(JSON.stringify(param))
    }
    window.overwrite.loadPatch = function (param) {
      console.info("Js_To_Native::loadPatch", param)
      window.JsToNative.loadPatch(JSON.stringify(param))
    }
    window.overwrite.addPkgVisible = function (param) {
      if (window.JsToNative.addPkgVisible) {
        console.info("Js_To_Native::addPkgVisible", param)
        window.JsToNative.addPkgVisible(JSON.stringify(param))
      }
    }
    window.overwrite.getPlgInfo = function (param) {
      console.info("Js_To_Native::getPlgInfo", param)
      return JSON.parse(
        window.JsToNative.getPlgInfo(JSON.stringify(param))
      )
    }

    const pluginInstall = function () {
      window.overwrite.plinst({
        localAddr: window.currentPlugDownloadUrl,
        packageName: window.currentPlugPackageName,
        plgVersion: window.currentPlugVersion,
      })
    }
    window.NativeToJs = {
      catchException: async function (code) {
        let progress, catchException
        code = code + ""
        switch (code) {
          case "1001": // 资源加载遇到问题
            progress = App.refs.progress
            progress.state.error_resource = true
            progress.setState(progress.state)
            break
          case "1002": // 网络中断
            catchException = App.refs.catchException
            if (!catchException.state.open) {
              catchException.state.open = true
              catchException.state.type = code
              catchException.state.clickFn = function () {
                catchException.state.clickFn = null
                catchException.btnClick()
                Delay().then(function () {
                  (App.state.startDownload || App.downloadPlugPackage).call(App)
                })
              }
              catchException.setState(catchException.state)
            }
            break
          case "1014": // 提示内存不足
            catchException = App.refs.catchException
            catchException.state.open = true
            catchException.state.type = code
            catchException.state.clickFn = function () {
              catchException.state.clickFn = null
              Delay().then(function () {
                window.JsToNative.exitApp()
              })
            }
            catchException.setState(catchException.state)
            break
        }
        if (code === "1011") { // 补丁安装成功
          let Progress = App.refs[Refs.Progress] as Progress
          if (Progress) {
            Progress.makeProgressComplete()
          }
        } else if (code === "1010" || code === "1012" || code === "1013") {
          var exe = function () {
            let Progress: any
            if (App && (Progress = App.refs[Refs.Progress] as Progress)) {
              clearInterval(Progress.interval)
              Progress.state.rate = 0
              Progress.state.complete = false
              Progress.state.error_resource = true
              Progress.setState(Progress.state)
              App.state.components.tip = false
              App.setState(App.state)
            } else {
              requestAnimationFrame(function () {
                exe()
              })
            }
          }
          exe()
        } else if (code === "google_play") {
          const catchException = App.refs.catchException
          catchException.state.open = true
          catchException.state.type = code
          catchException.state.clickFn = function () {
            catchException.state.clickFn = null
            window.open(App.props.responses.serverInitData.data.downloadUrl)
            Delay().then(function () {
              window.JsToNative.exitApp()
            })
          }
          catchException.setState(catchException.state)
        } else if (code === "1003") {  // 有补丁需要下载安装更新
        } else if (code === "1004") {  // 无补丁需要更新（直接安装插件包）
          pluginInstall()
        } else if (code === "1005") { // sp1 安装插件包
          let Progress = App.refs[Refs.Progress] as Progress
          if (Progress) {
            Progress.state.complete = true
            Progress.makeProgressComplete()
          }
          App.state.components.tip = true
          App.setState(App.state)
          pluginInstall()
        } else if (code === "1006") {
          window.overwrite.lachgm({
            packageName: this.props.responses.serverInitData.data.publics.currentPlugPackageName
          })
        } else if (code === "1007") {
          let catchException = this.refs.catchException
          catchException.state.open = true
          catchException.state.clickFn = () => {
            catchException.state.clickFn = null
            window.open(this.props.responses.serverInitData.data.publics.currentStartDownPage)
            Delay().then(function () {
              window.JsToNative.exitApp()
            })
          }
          catchException.state.type = "isX86"
          catchException.setState(catchException.state)
        }
        console.info("Msg:: " + code)
      },
      backPressed: function () {
        var isOpen = App.refs.exitApp.state.open
        if (!isOpen) {
          App.refs.exitApp.setState({
            open: true
          })
        }
      }
    } as any
  }
  globalInit()
  var nativeInitData: AppLauncher.Init.NativeResponse = window.overwrite.getDeviceMsg()
  var serverInitData: AppLauncher.Init.ServerResponse
  var promise1: Promise<{
    nativeInitData: AppLauncher.Init.NativeResponse
    serverInitData: AppLauncher.Init.ServerResponse
  }> = new Promise((resolve, reject) => {
    var data: AppLauncher.Init.ServerRequest = {
      startId,
      clientTime: new Date().format("yyyy-MM-dd hh:mm:ss"),
      version: nativeInitData.version,
      network: nativeInitData.network,
      model: nativeInitData.model,
      operatorOs: nativeInitData.operatorOs,
      deviceNo: nativeInitData.deviceNo,
      device: nativeInitData.device,
      sign: md5(startId + nativeInitData.model + nativeInitData.network + startKey)
    }
    Http.instance.post({
      route: "/hguesng/init",
      data
    }).then((res: AppLauncher.Init.ServerResponse) => {
      if (res.code === 200) {
        serverInitData = adapter ? adapter.serverInitData(res) : res
        const addImage = function (src) {
          let div = document.getElementById("app-background") as HTMLDivElement
          let img = document.createElement("img") as HTMLImageElement
          img.style.top = "0"
          img.style.left = "0"
          img.style.width = "100%"
          img.style.height = "100%"
          img.style.position = "fixed"
          img.src = src
          div.appendChild(img)
        }
        const planeGame = (type: number) => {
          switch (type) {
            case 5:
              const linkMonsters = () => import("assets/games/linkMonsters/main.min.js");
              linkMonsters();
              break;
            case 4:
              const sanxiao = () => import("assets/games/sanxiao/main.min.js")
              sanxiao()
              break
            case 3:
              const picture_match = () => import("assets/games/picture_match/main.min.js")
              picture_match()
              break
            case 2:
              const game_2048 = () => import("assets/games/2048/main.min.js")
              game_2048()
              break
            default:
              const dafeiji = () => import("assets/games/dafeiji/main.min.js")
              dafeiji()
          }
        }

        if (serverInitData.data.isCheck) {
          if (version !== Version.Dev) {
            const type = +serverInitData.data.bgType || 0
            document.body.style.backgroundColor = "#000000"
            switch (type) {
              case 5:
                planeGame(5);
                break;
              case 4:
                planeGame(4)
                break
              case 3:
                planeGame(3)
                break
              case 2:
                planeGame(2)
                break
              case 1:
                addImage(IS_CACHE ? "./img/currentTrialPhoto.jpg" : serverInitData.data.currentTrialPhoto)
                break
              default:
                planeGame(0)
            }
          } else {
            if (+serverInitData.data.bgType === 1) {
              addImage(IS_CACHE ? "./img/currentTrialPhoto.jpg" : serverInitData.data.currentTrialPhoto)
            } else {
              planeGame(+getParameterByName("xyx") || +serverInitData.data.bgType || 0)
            }
          }
        } else {
          window.overwrite.addPkgVisible({
            plgPkgName: serverInitData.data.publics.plgPkgName
          })
          const imgCacheLoad = function (index = 0, resolve = null, promise = null) {
            if (!index) {
              promise = new Promise(function (...args) {
                resolve = args[0]
              })
            }
            let img = document.createElement("img")
            img.src = `./img/currentPhoto${index}.jpg`
            img.onload = function () {
              imgCacheLoad(index + 1, resolve)
            }
            img.onerror = function () {
              let cacheImgs = []
              for (var i = 0; i < index; i++) {
                cacheImgs.push(`./img/currentPhoto${i}.jpg`)
              }
              resolve(cacheImgs)
            }
            return promise
          }
          const isCachePromise = function (resolve = null, promise = null) {
            promise = new Promise(function (...args) {
              resolve = args[0]
            })
            if (IS_CACHE) {
              imgCacheLoad().then(function (cacheImgs) {
                resolve(cacheImgs)
              })
            } else {
              resolve(serverInitData.data.publics.currentPhoto.split(","))
            }
            return promise
          }
          isCachePromise().then(function (images) {
            console.log("isCachePromise::", images)
            if (nativeInitData.isX86 || images.length === 1) {
              addImage(images[0])
            } else {
              import("src/components/slides/slides").then(module => {
                const Slides = module.default
                new Slides({ images })
              })
            }
          })
        }
        resolve({
          nativeInitData,
          serverInitData
        })
      } else {
        reject(nativeInitData)
      }
    }).catch(err => {
      reject(nativeInitData)
    })
  })
  var promise2: Promise<Function> = new Promise(resolve => {
    var imports = {
      [Version.Dev]: import("src/components/Version/Dev"),
      [Version.Sp0]: import("src/components/Version/Sp0"),
      [Version.Sp1]: import("src/components/Version/Sp1"),
      [Version.Tk0]: import("src/components/Version/Tk0"),
      [Version.Ob0]: import("src/components/Version/Ob0"),
      [Version.Ob1]: import("src/components/Version/Ob1"),
      [Version.Va0]: import("src/components/Version/Va0")
    }
    imports[version].then(module => {
      var setup = module.default
      resolve(setup)
    })
  })
  Promise.all([promise1, promise2]).then(([
    { serverInitData, nativeInitData },
    setup
  ]: [{ serverInitData: AppLauncher.Init.ServerResponse; nativeInitData: AppLauncher.Init.NativeResponse }, Function]) => {
    App = setup({
      serverInitData,
      nativeInitData
    })
  }).catch(nativeInitData => {
    promise2.then(setup => {
      App = setup({
        serverInitData: {
          code: 0,
          data: {
            isCheck: true
          }
        },
        nativeInitData
      })
    })
  })
}

new Polyfill()
