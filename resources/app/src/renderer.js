const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  const ConnectElement = document.getElementById("connect");
  if (ConnectElement) {
    ConnectElement.addEventListener("click", () => {
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
  const HiButton = document.getElementById("say-hi-button");
  if (HiButton) {
    HiButton.addEventListener("click", () => {
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

window.addEventListener("message", (_0x540805) => {
  if (_0x540805.origin !== "https://emeraldchat.com") {
    console.error("Origin not allowed:", _0x540805.origin);
    return;
  }
  console.log("Message from iframe:", _0x540805.data);
  handleIncomingMessage(_0x540805.data);
});
function handleIncomingMessage(message) {
  if (message.includes("trigger-word")) {
    console.log("Trigger word detected!");
    sendAutomatedResponse('Automated response triggered by "trigger-word".');
  }
}
function sendAutomatedResponse(response) {
  ipcRenderer.send("send-message-to-local-view", response);
  console.log("Automated response sent:", response);
}

function fetchUserData() {
  fetch("https://emeraldchat.com/channel_json?id=77")
    .then((channeldata) => channeldata.json())
    .then((channeldatajson) => {
      console.log("Response data:", channeldatajson);
      if (channeldatajson && channeldatajson.members) {
        const memberlist = channeldatajson.members.map((member) => ({
          id: member.id,
          name: member.display_name,
        }));

        console.log("Captured users:", memberlist);
        ipcRenderer.send("user-data", memberlist);
      } else {
        console.error("No users found in response:", channeldatajson);
      }
    })
    ["catch"]((error) => console.error("Error fetching user data:", error));
}
