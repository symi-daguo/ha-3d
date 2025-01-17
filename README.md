# Home Assistant 3D户型图集成

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

这是一个用于Home Assistant的3D户型图集成，支持实时显示和控制设备状态。

## 功能特点

- 支持3D户型图显示
- 区域实体绑定
- 实时状态更新
- 全屏显示功能
- 支持点击控制
- 可视化配置界面

## 安装

### HACS安装
1. 在HACS中添加自定义存储库：
   - 存储库URL: https://github.com/symi-daguo/ha-3d
   - 类别: Integration

2. 在HACS中搜索并安装"3D Floor Plan"

3. 重启Home Assistant

### 手动安装
1. 下载最新版本
2. 复制`custom_components/ha3d`文件夹到你的`custom_components`目录
3. 重启Home Assistant

## 配置

1. 在Home Assistant的配置 -> 集成中添加"3D Floor Plan"
2. 上传你的户型图
3. 配置区域和实体
4. 保存配置

## 使用方法

### 上传户型图
1. 准备好你的户型图（支持PNG、JPG格式）
2. 在配置界面上传

### 配置区域
1. 点击"添加区域"
2. 选择要绑定的实体
3. 调整区域位置和大小
4. 保存设置

### 控制设备
- 点击区域可以控制对应的设备
- 设备状态会实时显示在界面上
- 支持全屏显示模式

## 常见问题

Q: 支持哪些类型的实体？
A: 目前支持所有可开关控制的实体，如灯光、开关等。

Q: 如何调整区域大小？
A: 在配置界面中可以通过拖拽来调整区域的大小和位置。

## 更新日志

### v1.0.0
- 初始发布
- 基本功能实现

## 贡献

欢迎提交问题和功能建议到 [GitHub Issues](https://github.com/symi-daguo/ha-3d/issues)。

## 许可

本项目采用 MIT 许可证。 