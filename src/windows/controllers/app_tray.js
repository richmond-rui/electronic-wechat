/**
 * Created by Zhongyi on 5/2/16.
 */

'use strict';

const path = require('path');
const { app, Menu, nativeImage, Tray, ipcMain } = require('electron');

const AppConfig = require('../../configuration');

const lan = AppConfig.readSettings('language');

const assetsPath = path.join(__dirname, '../../../assets');

let Common;
if (lan === 'zh-CN') {
  Common = require('../../common_cn');
} else {
  Common = require('../../common');
}

class AppTray {
  constructor(splashWindow, wechatWindow) {
    this.splashWindow = splashWindow;
    this.wechatWindow = wechatWindow;
    this.lastUnreadStat = 0;

    fs.readFile(this.TRAY_CONFIG_PATH, (err, data) => {
      if (err) {
        this.trayColor = 'white';
        fs.writeFile(this.TRAY_CONFIG_PATH, '{"color":"white"}',function(msg){
          console.log("fs.writeFile==",msg);
        });
      } else {
        this.trayColor = JSON.parse(data.toString()).color;
      }
      this.createTray();
    });
  }

  createTray() {
    let image;
    if (process.platform === 'linux' || process.platform === 'win32') {
      image = nativeImage.createFromPath(path.join(assetsPath, `tray_${this.trayColor}.png`));
      this.trayIcon = image;
      this.trayIconUnread = nativeImage.createFromPath(path.join(assetsPath, `tray_unread_${this.trayColor}.png`));
    } else {
      image = nativeImage.createFromPath(path.join(assetsPath, 'status_bar.png'));
    }
    image.setTemplateImage(true);

    this.tray = new Tray(image);
    this.tray.setToolTip(Common.ELECTRONIC_WECHAT);

    ipcMain.on('refreshIcon', () => this.refreshIcon());

    if (process.platform === 'linux' || process.platform === 'win32') {
      const contextMenu = Menu.buildFromTemplate([
        { label: 'Show', click: () => this.hideSplashAndShowWeChat() },
        { label: 'Exit', click: () => app.exit(0) },
      ]);
      this.tray.setContextMenu(contextMenu);
    }
    this.tray.on('click', () => this.hideSplashAndShowWeChat());
  }

  setTitle(title) {
    this.tray.setTitle(title);
  }

  hideSplashAndShowWeChat() {
    if (this.splashWindow.isShown) return;
    this.wechatWindow.show();
  }

  refreshIcon() {
    this.trayColor = AppConfig.readSettings('tray-color');
    this.trayIcon = nativeImage.createFromPath(path.join(assetsPath, `tray_${this.trayColor}.png`));
    this.trayIconUnread = nativeImage.createFromPath(path.join(assetsPath, `tray_unread_${this.trayColor}.png`));
    if (this.lastUnreadStat === 0) {
      this.tray.setImage(this.trayIcon);
    } else {
      this.tray.setImage(this.trayIconUnread);
    }
  }

  setUnreadStat(stat) {
    if (stat === this.lastUnreadStat) return;
    this.lastUnreadStat = stat;
    if (stat === 0) {
      this.tray.setImage(this.trayIcon);
    } else {
      this.tray.setImage(this.trayIconUnread);
    }
  }
}

module.exports = AppTray;
