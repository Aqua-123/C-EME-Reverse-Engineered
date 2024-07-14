const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");
const axios = require("axios");

let mainWindow;
let localViewWindow;
let isLocalViewWindowOpen = false;
let proxyList = [];
let proxyIndex = 0x0;

async function fetchProxyList() {
  try {
    const RandomProxyRequest = await axios.get(
      "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=yes&anonymity=all"
    );
    proxyList = RandomProxyRequest.data.split("\n").filter((_proxy) => _proxy);
    console.log("Proxy list fetched:", proxyList.length, "proxies available.");
  } catch (error) {
    console.error("Error fetching proxy list:", error);
  }
}

function getRandomProxy() {
  if (proxyList.length === 0x0) {
    console.log("No proxies available, returning null.");
    return null;
  }
  proxyIndex = Math.floor(Math.random() * proxyList.length);
  return proxyList[proxyIndex];
}

function getRandomUserAgent() {
  const BrowserList = [
    { name: "Chrome", version: "91.0.4472.124" },
    { name: "Firefox", version: "89.0" },
    { name: "Safari", version: "14.1.1" },
    { name: "Edge", version: "91.0.864.48" },
  ];

  const DeviceList = [
    {
      name: "Windows NT 10.0; Win64; x64",
      devices: ["PC"],
    },
    {
      name: "Macintosh; Intel Mac OS X 10_15_7",
      devices: ["Mac"],
    },
    {
      name: "X11; Ubuntu; Linux x86_64",
      devices: ["PC"],
    },
    {
      name: "Linux; Android 11; SM-G991B",
      devices: ["Android"],
    },
  ];
  const RandomBrowser =
    BrowserList[Math.floor(Math.random() * BrowserList.length)];
  const RandomDevice =
    DeviceList[Math.floor(Math.random() * DeviceList.length)];
  const RandomDeviceType =
    RandomDevice.devices[
      Math.floor(Math.random() * RandomDevice.devices.length)
    ];

  return (
    "Mozilla/5.0 (" +
    RandomDevice.name +
    ") AppleWebKit/537.36 (KHTML, like Gecko) " +
    RandomBrowser.name +
    "/" +
    RandomBrowser.version +
    " " +
    RandomDeviceType
  );
}
async function clearCacheAndLoadURL(browserWindow, url, options = {}) {
  try {
    console.log("Clearing cache and storage data...");

    if (!options.keepCache) {
      await session.defaultSession.clearCache();
      await session.defaultSession.clearStorageData({
        storages: [
          "cookies",
          "localstorage",
          "caches",
          "indexdb",
          "serviceworkers",
        ],
      });
      console.log("Cache and storage data cleared.");
    } else {
      console.log("Keeping cache as requested.");
    }

    if (options.proxy) {
      console.log("Using proxy:", options.proxy);
      await session.defaultSession.setProxy({
        proxyRules: "http://" + options.proxy,
      });
    } else {
      console.log("Clearing proxy settings.");
      await session.defaultSession.setProxy({});
    }

    const userAgent = getRandomUserAgent();
    browserWindow.webContents.setUserAgent(userAgent);
    console.log("User agent set to:", userAgent);

    const randomWidth = Math.floor(Math.random() * 800 + 400);
    const randomHeight = Math.floor(Math.random() * 600 + 300);
    const randomXPosition = Math.floor(Math.random() * (1920 - randomWidth));
    const randomYPosition = Math.floor(Math.random() * (1080 - randomHeight));

    browserWindow.setSize(randomWidth, randomHeight);
    browserWindow.setPosition(randomXPosition, randomYPosition);
    console.log(
      `Window size set to: ${randomWidth}x${randomHeight}, position set to: ${randomXPosition},${randomYPosition}`
    );

    await browserWindow.loadURL(url);
    console.log("URL loaded:", url);
  } catch (error) {
    console.error("Error during cache clearing or URL loading:", error);
  }
}

async function spoofMACAddress() {
  try {
    await macchanger.random("en0");
    console.log("MAC address spoofed successfully.");
  } catch (error) {
    console.error("Error spoofing MAC address:", error);
  }
}
async function createMainWindow() {
  console.log("Creating main window...");

  // Spoof the MAC address before creating the main window
  await spoofMACAddress();

  // Create the main window
  mainWindow = new BrowserWindow({
    width: 800, // 0x320
    height: 600, // 0x258
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow.setMenuBarVisibility(false);

  // Clear cache and load the serial key page
  clearCacheAndLoadURL(
    mainWindow,
    "file://" + path.join(__dirname, "src", "serial_key.html")
  )
    .then(() => {
      console.log("Main window loaded successfully.");
    })
    .catch((error) => {
      console.error("Error loading main window:", error);
    });

  // Handle the main window close event
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Handle the check-serial-key event
  ipcMain.on("check-serial-key", async (event, serialKey) => {
    try {
      const response = await axios.post(
        "https://sphinxnet.lol/check-serial-key",
        { serialKey }
      );
      if (response.data.valid) {
        clearCacheAndLoadURL(
          mainWindow,
          "file://" + path.join(__dirname, "src", "index.html")
        );
      } else {
        event.reply("serial-key-invalid");
      }
    } catch (error) {
      console.error("Error checking serial key:", error);
      event.reply("serial-key-error", error.message);
    }
  });

  // Handle the connect-to-emeraldchat event
  ipcMain.on("connect-to-emeraldchat", async (event, options) => {
    const proxy = getRandomProxy();
    if (proxy) {
      await clearCacheAndLoadURL(mainWindow, "https://emeraldchat.com", {
        ...options,
        proxy,
      });
    } else {
      console.log("No proxy available, loading without proxy.");
      await clearCacheAndLoadURL(
        mainWindow,
        "https://emeraldchat.com",
        options
      );
    }
  });

  // Handle the check-local-view-status event
  ipcMain.on("check-local-view-status", (event) => {
    event.reply(isLocalViewWindowOpen ? "connected" : "disconnected");
  });

  // Handle the open-local-view event
  ipcMain.on("open-local-view", () => {
    if (!localViewWindow) {
      createLocalViewWindow();
    } else {
      localViewWindow.show();
      isLocalViewWindowOpen = true;
      mainWindow?.webContents.send("connected");
    }
  });

  // Handle the send-message-to-local-view event
  ipcMain.on("send-message-to-local-view", (event, message) => {
    if (localViewWindow && isLocalViewWindowOpen) {
      localViewWindow.webContents.send("message-from-main", message);
    }
  });

  // Handle the insert-html-to-local-view event
  ipcMain.on("insert-html-to-local-view", (event, html) => {
    if (localViewWindow && isLocalViewWindowOpen) {
      localViewWindow.webContents.send("insert-html", html);
    }
  });

  // Handle the manipulate-dom-in-local-view event
  ipcMain.on("manipulate-dom-in-local-view", (event, script) => {
    if (localViewWindow && isLocalViewWindowOpen) {
      localViewWindow.webContents.send("manipulate-dom", script);
    }
  });

  // Handle the execute-user-script event
  ipcMain.on("execute-user-script", (event, script) => {
    if (localViewWindow && isLocalViewWindowOpen) {
      console.log("Sending script to local view window:", script);
      localViewWindow.webContents.send("execute-user-script", script);
    } else {
      console.error("Local view window is not open");
    }
  });

  // Handle the log-to-main-window event
  ipcMain.on("log-to-main-window", (event, message) => {
    mainWindow?.webContents.send("log-message", message);
  });
}

async function createLocalViewWindow() {
  localViewWindow = new BrowserWindow({
    width: 800, // 0x320
    height: 600, // 0x258
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
  });

  localViewWindow.setMenuBarVisibility(false);

  const loadingTimeout = setTimeout(() => {
    if (localViewWindow) {
      localViewWindow.webContents.stop();
      console.error("Loading timeout, stopping web contents.");
    }
  }, 30000); // 0x7530 (30 seconds)

  try {
    const proxy = getRandomProxy();
    if (proxy) {
      await clearCacheAndLoadURL(localViewWindow, "https://emeraldchat.com", {
        proxy,
      });
    } else {
      console.log("No proxy available, loading without proxy.");
      await clearCacheAndLoadURL(localViewWindow, "https://emeraldchat.com");
    }
    console.log("Local view window loaded successfully.");
  } catch (error) {
    console.error("Error loading local view window:", error);
  }

  localViewWindow.webContents.on("did-fail-load", () => {
    clearTimeout(loadingTimeout);
    console.error("Failed to load URL.");
  });

  localViewWindow.webContents.on("did-finish-load", () => {
    clearTimeout(loadingTimeout);
    console.log("Finished loading URL.");
    localViewWindow.webContents
      .executeJavaScript(
        `
          document.body.innerHTML.includes('Emerald Chat')
        `
      )
      .then((isEmeraldChat) => {
        if (!isEmeraldChat) {
          console.error("Emerald Chat not found in the body innerHTML.");
        } else {
          isLocalViewWindowOpen = true;
          mainWindow?.webContents.send("connected");
        }
      });
  });

  localViewWindow.on("closed", () => {
    localViewWindow = null;
    isLocalViewWindowOpen = false;
    mainWindow?.webContents.send("disconnected");
  });

  localViewWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("https://emeraldchat.com/")) {
      event.preventDefault();
      console.log("Navigation prevented to:", url);
    }
  });

  localViewWindow.webContents.on("new-window", (event, url) => {
    if (!url.startsWith("https://emeraldchat.com/")) {
      event.preventDefault();
      console.log("New window prevented to:", url);
    }
  });
}

app.on("ready", async () => {
  await fetchProxyList();
  createMainWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (!mainWindow) {
    createMainWindow();
  }
});
