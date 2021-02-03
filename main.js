
const {app, BrowserWindow,nativeImage, Menu, screen} = require('electron')
const url = require("url");
const path = require("path");
const ipcMain = require('electron').ipcMain;

process.env.GOOGLE_API_KEY = "AIzaSyB1L9PaICXQEQxz63Z6e2ECmWuHGpZCRmA"

let browserImage = nativeImage.createFromPath(__dirname + '/dist/openvidu-call/assets/images/logoEn.png'); 
   
let size 

let mainWindow, loadingScreen, loadErrorScreen,isMaximized,
windowParams = {  
    show: false,
    icon : browserImage,    
  //alwaysOnTop:true //display show on top
  
};
window.console.log = function () {};
let menuTemplate = [  
  {
    label : "View",
    submenu : [
      {
        label: 'Reload', accelerator: 'F5',  
        click: function (item, focusedWindow) {
          // reload the page
          reloadPage()       
          /* if (focusedWindow) {
            focusedWindow.reload();
          } */
        }
      },
      {
        label: 'Toggle Dev Tools', accelerator: 'F12',
        click: function () {
          mainWindow.webContents.toggleDevTools();       
        }
      }
      //,
      // {
      //   label: 'Maximize', accelerator: 'F8',
      //   click: function () {
      //       isMaximized = true
      //       mainWindow.maximize();        
      //   }
      // },
      // {
      //   label: 'Original Size', accelerator: 'F7',
      //   click: function () {
      //     if(isMaximized)
      //     {
      //       isMaximized = false
      //       mainWindow.unmaximize(); 
      //     }
      //   }
      // }
      ]
  }
];

function reloadPage()
{  
  //mainWindow.loadURL('file://' + __dirname + '/dist/MEnterprise/index.html')
  app.exit()  
  app.relaunch() 
}

function createWindow () {
  
  mainWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    show: false,
    icon : browserImage,
    webPreferences: {
      nodeIntegration: true
    }
  })  
  
  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);  
  
  mainWindow.once('ready-to-show', () => {
      mainWindow.show() 
      if (loadingScreen) {
        let loadingScreenBounds = loadingScreen.getBounds();
        mainWindow.setBounds(loadingScreenBounds);
        loadingScreen.close();
    }
    else if (loadErrorScreen) {
        let loadingScreenBounds = loadErrorScreen.getBounds();
        mainWindow.setBounds(loadingScreenBounds);
        loadErrorScreen.close();
    }
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, `/dist/openvidu-call/index.html`),
    protocol: "file:",
    slashes: true
  }))

  mainWindow.webContents.on("did-fail-load", function() {
    console.info("did-fail-load");
    if(loadErrorScreen) loadErrorScreen.close();
    createErrorScreen()
  });

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
  
  /* mainWindow.on('maximize',(e) =>{
      console.log('electron maximize');
      onWindowResize()
  });
  mainWindow.on('show',(e) =>{
      console.log('electron show');
  });
  mainWindow.on('move',(e) =>{
      console.log('electron move');
  }); */

}
   


app.on('window-all-closed', function () {
  console.log('window-all-closed')
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  console.log('app.on activate')
  if (mainWindow === null) {
    createLoadingScreen();
    createWindow();
  }
})


function createErrorScreen() {
  windowParams.frame = true
  delete windowParams.backgroundColor 
  delete windowParams.skipTaskbar
  loadErrorScreen = new BrowserWindow(Object.assign(windowParams, {parent: mainWindow}));
  loadErrorScreen.loadURL('file://' + __dirname + '/error.html');
  loadErrorScreen.webContents.on('did-finish-load', () => {
    loadErrorScreen.show();
    mainWindow.hide()
  });
  loadErrorScreen.on('closed', function () {
    loadErrorScreen = null      
    mainWindow.close()
  })
}
  
function createLoadingScreen() {
  windowParams.frame = false
  windowParams.backgroundColor = '#011827';  
  windowParams.skipTaskbar = true
  loadingScreen = new BrowserWindow(Object.assign(windowParams, {parent: mainWindow}));
  loadingScreen.loadURL('file://' + __dirname + '/loading.html');
  loadingScreen.on('closed', () => loadingScreen = null);
  loadingScreen.webContents.on('did-finish-load', () => {
      loadingScreen.show();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  size = screen.getPrimaryDisplay().workAreaSize;
  windowParams.width =  size.width
  windowParams.height = size.height
  console.log('app.on ready')

  createLoadingScreen();
  createWindow();
});


ipcMain.on('maximize-me-please', (event, arg) => {  
  console.log('maximize-me-please')
  if(!isMaximized)
  {console.log('maximize')
    isMaximized = true
    mainWindow.maximize()  
  }  
})
ipcMain.on('original-size-me-please', (event, arg) => {  
    isMaximized = false
    mainWindow.unmaximize() 
})

ipcMain.on('enable-resize-me-please', (event, arg) => {  
    let obj = menuTemplate[0].submenu.find(x=>x.label == 'Original Size')
    obj.enabled = true
    obj = menuTemplate[0].submenu.find(x=>x.label == 'Maximize')
    obj.enabled = true    
  
    let menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu); 
})

ipcMain.on('disable-resize-me-please', (event, arg) => {  
  if(isMaximized)
  {    
    let obj = menuTemplate[0].submenu.find(x=>x.label == 'Original Size')
    
    obj.enabled = false
  }
  else{
    let obj = menuTemplate[0].submenu.find(x=>x.label == 'Maximize')
    
    obj.enabled = false
  }
  
  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);  
})





