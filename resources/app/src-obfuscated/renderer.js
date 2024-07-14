const createOneTimeFunction = (function () {
  let hasRun = true;
  return function (context, func) {
    const oneTimeFunction = hasRun
      ? function () {
          if (func) {
            const result = func.apply(context, arguments);
            func = null;
            return result;
          }
        }
      : function () {};
    hasRun = false;
    return oneTimeFunction;
  };
})();

// Called Every 5 Seconds
window.setInterval(PreventDebuggingAndReverseEngineering, 5000);

(function () {
  createOneTimeFunction(this, function () {
    // This regex matches strings that begin with 'function', followed by any number of spaces,
    // followed by an identifier starting with a letter, underscore, or dollar sign,
    // and continuing with any combination of letters, digits, underscores, or dollar signs,
    // followed by an open parenthesis.
    const functionRegex = new RegExp("function *\\( *\\)");
    // This regex matches strings that begin with '++', followed optionally by spaces,
    // and then followed by an identifier starting with a letter, underscore, or dollar sign,
    // and continuing with any combination of letters, digits, underscores, or dollar signs.
    const incrementRegex = new RegExp(
      "\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)",
      "i"
    );

    const initStringOrFunction = PreventDebuggingAndReverseEngineering("init");
    if (
      !functionRegex.test(initStringOrFunction + "chain") ||
      !incrementRegex.test(initStringOrFunction + "input")
    ) {
      initStringOrFunction("0");
    } else {
      PreventDebuggingAndReverseEngineering();
    }
  })();
})();

const ProtectConsole = (function () {
  let canRun = true;
  return function (context, func) {
    const runOnce = canRun
      ? function () {
          if (func) {
            const result = func.apply(context, arguments);
            func = null;
            return result;
          }
        }
      : function () {};
    canRun = false;
    return runOnce;
  };
})();

const ProtectConsoleWrapper = ProtectConsole(this, function () {
  let globalObj;
  try {
    const getGlobal = Function(
      'return (function() {}.constructor("return this")( ));'
    );
    globalObj = getGlobal();
  } catch (error) {
    globalObj = window;
  }
  const consoleObj = (globalObj.console = globalObj.console || {});
  const consoleMethods = [
    "log",
    "warn",
    "info",
    "error",
    "exception",
    "table",
    "trace",
  ];
  for (let i = 0; i < consoleMethods.length; i++) {
    const boundFunction =
      ProtectConsole.constructor.prototype.bind(ProtectConsole);
    const methodName = consoleMethods[i];
    const originalMethod = consoleObj[methodName] || boundFunction;
    boundFunction.__proto__ = ProtectConsole.bind(protectConsole);
    boundFunction.toString = originalMethod.toString.bind(originalMethod);
    consoleObj[methodName] = boundFunction;
  }
});

ProtectConsoleWrapper();

const { ipcRenderer } = require("electron");
document.addEventListener("DOMContentLoaded", () => {
  const ConnectionDom = document.getElementById("connect");

  if (ConnectionDom) {
    ConnectionDom.addEventListener("click", () => {
      ipcRenderer.send("open-local-view");
      document.getElementById("status").innerText = "Connected";
    });
  }

  ipcRenderer.on("connected", () => {
    document.getElementById("status").innerText = "Connected";
  });

  ipcRenderer.on("disconnected", () => {
    document.getElementById("status").innerText = "Disconnected";
  });

  ipcRenderer.send("check-local-view-status");
  const ExploitButton = document.getElementById("exploit-button");
  if (ExploitButton) {
    ExploitButton.addEventListener("click", () => {
      triggerExploit();
    });
  }

  const SpamButton = document.getElementById("spam-button");
  if (SpamButton) {
    SpamButton.addEventListener("click", () => {
      sendSpamMessage();
    });
  }

  const SayHiButton = document.getElementById("say-hi-button");
  if (SayHiButton) {
    SayHiButton.addEventListener("click", () => {
      fetchUserData();
    });
  }

  const FetchUserDataButton = document.getElementById("fetch-user-data-button");
  if (FetchUserDataButton) {
    FetchUserDataButton.addEventListener("click", () => {
      document.getElementById("hidden-fetch-user-data-button").click();
    });
  }

  ipcRenderer.on("user-data", (event, userData) => {
    console.log("User data received:", userData);
    const userContainer = document.getElementById("user-container");
    if (userContainer) {
      userContainer.innerHTML = "";
      userData.forEach((user) => {
        const userDiv = document.createElement("div");
        userDiv.classList.add("p-2", "bg-gray-700", "rounded", "mb-2");
        let userInfoHTML = "";
        for (const key in user) {
          if (user.hasOwnProperty(key)) {
            userInfoHTML += `<div>${key}: ${user[key]}</div>`;
          }
        }
        userDiv.innerHTML = userInfoHTML;
        userDiv.addEventListener("click", () => {
          SelectedUserID = user.id;
          document.getElementById(
            "selected-user"
          ).textContent = `Selected User: ${user.name} (${user.id})`;
        });
        userContainer.appendChild(userDiv);
      });
    } else {
      console.error("User container element not found.");
    }
  });

  let SelectedUserID = null;
  const UpvoteButton = document.createElement("button");
  UpvoteButton.textContent = "Upvote";
  document.body.appendChild(UpvoteButton);
  UpvoteButton.addEventListener("click", () => {
    if (SelectedUserID) {
      GiveKarma(SelectedUserID, 1);
    }
  });
  const DownvoteButton = document.createElement("button");
  DownvoteButton.textContent = "Downvote";
  document.body.appendChild(DownvoteButton);
  DownvoteButton.addEventListener("click", () => {
    if (SelectedUserID) {
      GiveKarma(SelectedUserID, -1);
    }
  });

  function GiveKarma(recipientId, polarityValue) {
    const karmaGiveURL =
      "https://emeraldchat.com/karma_give?id=" +
      recipientId +
      "&polarity=" +
      polarityValue;

    fetch(karmaGiveURL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (response.status === 0xcc) {
          console.log("Vote sent successfully");
        } else {
          console.error("Failed to send vote:", response.statusText);
        }
      })
      ["catch"]((error) => {
        console.error("Error sending vote:", error);
      });
  }
  const SaveScript = document.getElementById("save-script");
  const ExecuteScript = document.getElementById("execute-script");
  const ScriptContent = document.getElementById("script-content");

  if (SaveScript && ScriptContent) {
    SaveScript.addEventListener("click", () => {
      const ScriptContentValue = ScriptContent.value;
      localStorage.setItem("userScript", ScriptContentValue);
      alert("Script saved locally!");
    });
  }
  if (ExecuteScript && ScriptContent) {
    ExecuteScript.addEventListener("click", () => {
      const ScriptContentValue = ScriptContent.value;
      console.log("Execute script button clicked");
      console.log("Script content:", ScriptContentValue);
      ipcRenderer.send("execute-user-script", ScriptContentValue);
    });
  }
});
function triggerExploit() {
  fetchUserData();
  console.log("Exploit triggered:", "Fetching user data...");
}
function sendSpamMessage() {
  ipcRenderer.send("send-message-to-local-view", "Test and it seems to work");
  console.log("Spam message sent:", "Test and it seems to work");
}

// Unused functions
function sendMessageToLocalView(_message) {
  ipcRenderer.send("send-message-to-local-view", _message);
  console.log("Message sent to local view:", _message);
}

// Unused functions
function insertHtmlToLocalView(_htmlContent) {
  ipcRenderer.send("insert-html-to-local-view", _htmlContent);
  console.log("HTML inserted to local view:", _htmlContent);
}

// Unused functions
function manipulateDomInLocalView(_domElement) {
  ipcRenderer.send("manipulate-dom-in-local-view", _domElement);
  console.log("DOM manipulated in local view:", _domElement);
}

window.addEventListener("message", (MessageEvent) => {
  if (MessageEvent.origin !== "https://emeraldchat.com") {
    console.error("Origin not allowed:", MessageEvent.origin);
    return;
  }
  console.log("Message from iframe:", MessageEvent.data);
  handleIncomingMessage(MessageEvent.data);
});

function handleIncomingMessage(MessageString) {
  if (MessageString.includes("trigger-word")) {
    console.log("Trigger word detected!");
    sendAutomatedResponse('Automated response triggered by "trigger-word".');
  }
}
function sendAutomatedResponse(message) {
  ipcRenderer.send("send-message-to-local-view", message);
  console.log("Automated response sent:", message);
}

function fetchUserData() {
  const url = "https://emeraldchat.com/channel_json?id=77";
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log("Response data:", data);

      if (data && data.members) {
        const users = data.members.map((member) => ({
          id: member.id,
          name: member.display_name,
        }));
        console.log("Captured users:", users);
        ipcRenderer.send("user-data", users);
      } else {
        console.error("No users found in response:", data);
      }
    })
    .catch((error) => console.error("Error fetching user data:", error));
}

//
function PreventDebuggingAndReverseEngineering(mainFlag) {
  function InnerFunction(counter) {
    if (typeof counter === "string") {
      // Creates an infinite loop, mainly for obfuscation and preventing decompilation
      return function () {}.constructor("while (true) {}").apply("counter");
    } else {
      if (("" + counter / counter).length !== 1 || counter % 20 === 0) {
        (function () {
          return true;
        })
          .constructor("debugger")
          .call("action");
      } else {
        (function () {
          return false;
        })
          .constructor("debugger")
          .apply("stateObject");
      }
    }
    InnerFunction(++counter);
  }

  try {
    if (mainFlag) {
      return InnerFunction;
    } else {
      InnerFunction(0);
    }
  } catch (error) {}
}
