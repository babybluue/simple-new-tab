## 对于网站图标的重构

### 最终目标

在用户没有自定义图标前，图标将只会从本地获取，如果本地预设了图标，优先使用本地预设 assets/logo下的图标，否则使用 Chrome 缓存的图标，即 customFavicon > Preset > Chrome 缓存的图标。

### 逻辑梳理

- 图标数据结构

  ```ts
  interface SiteIcon {
    url: string // 网站 URL
    title: string // 网站标题
    favicon: string // 网站图标 (本地预设或 Chrome 缓存)
    customFavicon: string // 用户自定义图标
  }
  ```

- 预设网站
  现在预设网站在 assets/logo 下一定会有对应的图标，并且将图标路径结果赋给 favicon

- 图标获取逻辑
  - 如果 customFavicon 不为空，则直接使用 customFavicon
  - 如果 customFavicon 为空，则使用 Preset 中的图标
  - 如果 Preset 中不存在图标，则使用 Chrome 缓存的图标，在获取 Chrome 缓存图标时，使用 url 的域名部分判断，忽略 url 中的参数

### 更改说明

- 图标获取逻辑更新

  删除所有以前获取的逻辑，删除无用的文件，无用的方法，以新的逻辑重构，精简代码，将这些逻辑精简在一个文件里。

- 站点编辑功能

  修改：用户自定义图标将直接赋值给 customFavicon，并且作为后续取图标的第一优先级；并且在自定义图标后面添加两个 radio 按钮，提供 google 和 unavatar 两种图标获取方式，用户选中之后，将更新 customFavicon 的值。

  新增：在表单中添加一个图标即时显示的功能，当用户输入图标 URL 时，图标会即时显示在表单中

  删除：删除现在表单中的本地图标这个选项，以及它相关的逻辑。
