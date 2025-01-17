# Home Assistant 3D户型图集成

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

这是一个用于Home Assistant的3D户型图集成，支持通过Web界面配置和管理户型图，实现设备状态的可视化显示和控制。完美配合[冬瓜HA的切图工具](http://cutimg.wghaos.com/)使用。

## 功能特点

- 支持Web界面配置，无需手动编辑配置文件
- 拖拽上传图片
- 实时状态显示
- 点击控制设备
- 全屏显示功能
- 支持多区域管理
- 完美配合冬瓜HA切图工具

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

## 使用方法

### 第一步：准备户型图
1. 访问[冬瓜HA切图工具](http://cutimg.wghaos.com/)
2. 上传两张户型图：
   - 一张是所有灯关闭的状态图
   - 一张是所有灯打开的状态图
3. 按房间区域进行框选
4. 导出所有图片

### 第二步：配置集成
1. 在Home Assistant中添加集成
2. 搜索"3D Floor Plan"并添加
3. 添加完成后，侧边栏会出现"3D户型图"菜单

### 第三步：配置区域
1. 点击侧边栏的"3D户型图"
2. 点击"+"添加新区域
3. 设置区域信息：
   - 输入区域名称
   - 选择要控制的设备
   - 上传开灯状态图片（拖放或点击上传）
   - 上传关灯状态图片（拖放或点击上传）
4. 点击保存按钮

### 第四步：使用
- 在主界面中可以看到完整的户型图
- 点击区域可以控制对应的设备
- 设备状态变化时，对应区域的图片会自动切换
- 支持全屏显示

## 常见问题

Q: 支持哪些类型的实体？
A: 目前支持所有可开关控制的实体，如灯光、开关等。

Q: 如何修改已添加的区域？
A: 在配置界面点击左侧的区域名称即可编辑。

Q: 图片格式要求？
A: 支持PNG、JPG格式，建议使用PNG格式以获得更好的显示效果。

Q: 图片存储在哪里？
A: 所有图片都存储在Home Assistant的`/config/www/home/`目录下。

## 更新日志

### v1.0.0
- 初始发布
- Web配置界面
- 区域管理
- 图片上传
- 实时状态显示
- 设备控制

## 贡献

欢迎提交问题和功能建议到 [GitHub Issues](https://github.com/symi-daguo/ha-3d/issues)。

## 致谢

- 感谢[冬瓜HA](https://github.com/shaonianzhentan/ha-docs)提供的切图工具
- 感谢Home Assistant社区的支持

## 许可

本项目采用 MIT 许可证。 