# Home Assistant 3D户型图集成

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

这是一个用于Home Assistant的3D户型图集成，支持将任意3D户型图URL集成到Home Assistant的侧边栏中，实现快速访问和控制。完美配合[冬瓜HA的切图工具](http://cutimg.wghaos.com/)使用。

## 功能特点

- 支持Web界面配置，无需手动编辑配置文件
- 支持任意3D户型图URL集成
- 可随时修改3D户型图地址
- 完美配合冬瓜HA切图工具
- 支持实时状态显示和控制

## 安装

### HACS安装（推荐）
1. 在HACS中添加自定义存储库：
   - 存储库URL: `https://github.com/symi-daguo/ha-3d`
   - 类别: Integration

2. 在HACS中搜索并安装"3D Floor Plan"

3. 重启Home Assistant

### 手动安装
1. 下载最新版本
2. 复制`custom_components/ha3d`文件夹到你的`custom_components`目录
3. 重启Home Assistant

## 配置方法

### 第一步：准备3D户型图
1. 访问[冬瓜HA切图工具](http://cutimg.wghaos.com/)
2. 上传并处理你的户型图
3. 获取生成的3D户型图URL地址

### 第二步：添加集成
1. 在Home Assistant中进入"配置" -> "设备与服务"
2. 点击右下角的"添加集成"按钮
3. 搜索"3D Floor Plan"或"3D户型图"
4. 在配置界面中输入你的3D户型图URL地址
5. 点击提交完成配置

### 第三步：使用
- 配置完成后，侧边栏会自动出现"3D户型图"菜单
- 点击即可访问你的3D户型图
- 可以通过3D户型图直接控制设备状态

### 修改配置
如果需要更换3D户型图：
1. 进入"配置" -> "设备与服务"
2. 找到"3D户型图"集成
3. 点击"配置"按钮
4. 输入新的URL地址
5. 点击提交保存更改

## 常见问题

Q: 支持哪些类型的URL？
A: 支持任何以http://或https://开头的有效URL地址。

Q: 如何获取3D户型图URL？
A: 可以使用冬瓜HA的切图工具生成，或使用其他支持URL访问的3D户型图服务。

Q: 配置后看不到侧边栏菜单？
A: 尝试刷新浏览器缓存，或重新启动Home Assistant。

Q: URL地址有特殊要求吗？
A: URL必须以http://或https://开头，且能够通过浏览器直接访问。

## 更新日志

### v1.1.0
- 添加配置流程支持
- 支持通过UI配置URL
- 支持实时修改URL
- 优化用户体验

### v1.0.0
- 初始发布
- 基础功能支持

## 贡献

欢迎提交问题和功能建议到 [GitHub Issues](https://github.com/symi-daguo/ha-3d/issues)。

## 致谢

- 感谢[冬瓜HA](https://github.com/shaonianzhentan/ha-docs)提供的切图工具
- 感谢Home Assistant社区的支持

## 许可

本项目采用 MIT 许可证。 