# launcher(游戏包启动器)

更新时间：2020.3.18

简介：主要是为了google和apple过审和更新，更新有插件包，补丁包等。
目前的方案共有：

1. dev：本地开发
2. sp0: Sophix
3. sp1:
4. ob0:obb包的方案
5. tk0: tinker
6. rb0:
7. va0:

使用的库有：[swiper](http://idangero.us/swiper/get-started/),[material-ui](https://material-ui.com/getting-started/installation/),[typescript](https://www.tslang.cn/docs/handbook/typescript-in-5-minutes.html)

构建：

1. [Jenkins](http://jenkins2.royale.com/view/prod-build/job/prod-build-frontend/job/launcher/) 正式打包流程是：选择prod-build-frontend-launcher > Build with Parameters > 在version中传入方案名：例如ob0，打包完成后，联系运维部署到需要的节点，现在有新加坡节点、德法节点、越南节点。

2. 测试的构建：npm run test ob0 打包好后连接国内测试服: cntest (国内测试服) `/data/sdk-test/sdk-start/launcher`上传就好。

   \- 上传命令 `rz -bey`；

    \- 解压命令: `unzip -o xxx`

    \- 删除: `rm -rf xxx`

    \- 对应的 ngix 路径：/usr/local/nginx/conf/vhosts/start-sg-sdk.conf

    \- 打包参数 方案名例：ob0

    \- 查看地址: http://sdk-start-test.changic.net.cn/sp05c9971e755c2eab303166f32692e3fb1/index.html?startKey=6630bba2bcf84a8eb62b602614cbb661&startId=9000&version=&xyx=

修复bug的流程：连上WIFI将DNS切换到172.16.2.206，然后启动器的请求正式服地址就会自动DNS解析到测试服，然后进行vconsole 进行调试修复，如不正常，联系后端配置测试服务器，再检查测试启动器上传没有，一般情况下是在手机上进行复现、修改，注意和原生对接。

## 目录说明

- assets： 资源目录
  - games：小游戏的资源目录，可在本地地址栏传xyx=Number来控制

- build 打包后的资源
- src 业务目录
  - bower：第三方的一些库
  - components：组件
  - factory：工具方法
    1. Delay
    2. x86和androidPie cpu类型和操作系统类型
- adapter：测试文件
- const：常量
- i18： 国际化
- main：主文件
- style：样式文件
- Tip： 提示的组件
- Utils： 工具方法，获取查询参数

## 原生到传js的方法和参数

参阅：index.d.ts中的JsToNative(js调用原生的接口)、NativeToJs(原生调用js),NativeResponse(原生提供的参数，用来和init接口后端返回的参数比较来确定更新)

## 后端接口

启动器的后端接口只有一个 /pocketgames/start/init
本地启动：`http://sdk-test.changic.net.cn:1612`;
正式服：域名由运维控制自动映射SERVER是一个常量‘’带包相对路径，一些老的项目没有映射，前端做映射，将来可以使用map
参数和返回值：index.d.ts中的ServerRequest和ServerResponse

## 组件

组件主要是有Progress和slides，进度条和走马灯，
Version中的主要是各个版本的启动器的页面
Tip中主要是一些提示

## 业务流程

入口文件：main.ts，前期处理：给Date的prototype上添加一个format格式化方法
开始： new Ployfill(); 给一些新的语法打补丁，
主体： window.Main();

1. 拿到游戏包的startKey和startId,
2. 判断原生提供的一些方法的存在与否，不存在本地环境则加载adapter提供测试环境;
3. 给window上的overwrite上添加方法，使用的装饰器模式，主要是为了调试bug，打印日志信息：
主要调用JsToNative中的同名的方法来和原生的ios和android交互，添加异常处理函数和插件安装的函数
4. 拿到设备信息，详情参阅index.d.ts中的 NativeResponse,Promise<{}>是typescript中对Promise的返回值的断言
5. promise1请求init接口拿到服务端的返回值，详情参阅index.d.ts中的  ServerResponse，promise2根据版本来却行要加载的页面组件，成功返回组件的渲染函数
```js
//init 接口的返回值,非提审状态
{
	code: 200
	data: {
		downloadUrl: "https://www.baidu.com/",
		isCheck: 0,
		publics: {
			bgType: "2" //显示的图片或者游戏
			currentPhoto: "http://res-pkg-cdn.pocketgamesol.com/pmfr/tt.png"
			currentPlugAppId: "10120"
			currentPlugDownloadUrl: "http://172.16.3.204/yuenan3dsCJQG.apk"
			currentPlugPackageId: "10001"
			currentPlugPackageName: "com.championtrainer.tw.plugin"
			currentPlugRplDownloadUrl: "http://172.16.3.204/hanguo3dsTH.apk"
			currentPlugUpdateWay: " 0"
			currentPlugVersion: "1.8.1"
			currentStartDownPage: "http://pkde.pocketgamesol.com/activity/apk-tip/"
			currentStartDownloadUrl: "https://www.baidu.com/"
			currentStartFbPage: "https://www.facebook.com/trainer3ds/"
			currentStartType: "1"
			currentTrialPhoto: "http://cdn-pkg-tx.pocketgamesol.com/kor/YC.jpg"
			patchURL: "http://172.16.3.204/patchtest2.apk"
			patchVersion: "1.0"
			plgPkgName: "com.ajkape.soqpeust"
			updateWay: 0
		}
	}
	error_msg: "success"
}
```

6. 当两个promise有一个未resolve则执行异常处理函数，输出错误信息，当都成功后执行渲染并将句柄留在App上以便后续操作
7. NativeTojs 中主要是异常处理函数 和处理按下返回按钮后调起popular来提示确认要退出吗？，如果有弹窗则什么都不做的函数。
8. 异常处理函数
    - 1001下载失败，将progress的文字改为资源加载遇到问题，并震动下载按钮
    - 1002网络连接异常，重新下载，等待最少500ms后重新下载
    - 1011补丁安装成功
    - 1010 进度条退为0，清除定时器，按1001处理
    - 1012代表打补丁失败
    - 1013补丁反解失败
    - google_play 打开下载连接下载，500毫秒后退出App
    - 1003 有补丁需要下载安装更新
    - 1004无补丁，直接安装插件包
    - 1005 sp1方案安装插件包
    - 1006 拉起插件包的接口
    - 1007 重新下载游戏，抱歉！您的设备无法安装此游戏包，请点击重新下载可兼容的游戏包!

### 具体方案的组件的流程

** Ob0**

### 启动器测试安装obb包

1. 准备好分包打包的Android安装包（apk+obb），比如说是：ABC.apk + ABC.obb

2. 先把apk安装到Android设备，然后将对应obb文件改名为：`main.<Bundle Version Code>.<包名>.obb`

3. 拷贝到Android设备的“/android/obb/<包名>/ ”路径下。  
4. 以上面的ABC为例（假设其“Bundle Version Code”值为2，包名为“com.Demo.ABC”）：
   - 首先，在Android设备上安装ABC.apk；- 接着，将ABC.obb改名为“main.2.com.Demo.ABC.obb”；
   - 然后，将文件“main.2.com.Demo.ABC.obb”拷贝到Android设备的“/android/obb/com. Demo.ABC/”路径下；
   - 启动App，你会发现新安装的APP已经可以正常使用了。
   -  一般实际情况是将obb文件考好，后安装，并且命名是已经完成的
