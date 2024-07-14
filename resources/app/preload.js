const { ipcRenderer } = require("electron");
window.addEventListener("DOMContentLoaded", () => {
  function loadScript(scriptUrl, callback) {
    // Create a new script element
    const scriptElement = document.createElement("script");
    // Set the script's source to the provided URL
    scriptElement.src = scriptUrl;
    // Set the callback to be called once the script is loaded
    scriptElement.onload = callback;
    // Ensure the script is executed in the order it is added
    scriptElement.async = false;
    // Append the script element to the document's head
    document.head.appendChild(scriptElement);
  }

  loadScript("https://code.jquery.com/jquery-3.6.0.min.js", () => {
    console.log("jQuery loaded");
    loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jquery-timeago/1.6.7/jquery.timeago.min.js",
      () => {
        console.log("jQuery timeago loaded");
        loadScript(
          "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js",
          () => {
            console.log("Bootstrap loaded");
          }
        );
      }
    );
  });

  ipcRenderer.on("message-from-main", (event, message) => {
    console.log("Received message from main:", message);
  });

  ipcRenderer.on("insert-html", (event, htmlContent) => {
    const newDiv = document.createElement("div");
    newDiv.innerHTML = htmlContent;
    document.body.appendChild(newDiv);
    console.log("Inserted HTML:", htmlContent);
  });

  ipcRenderer.on("manipulate-dom", (event, scriptContent) => {
    const scriptElement = document.createElement("script");
    scriptElement.textContent = scriptContent;
    document.body.appendChild(scriptElement);
    console.log("Executed script:", scriptContent);
  });

  ipcRenderer.on("execute-user-script", (event, userScript) => {
    console.log("Received script to execute:", userScript);
    try {
      eval(userScript);
      console.log("User script executed successfully");
    } catch (error) {
      console.error("Error executing user script:", error);
    }
  });

  let isFetching = false;
  let UserSelectionUI = null;
  let latestChannelID = 0x4d;

  function monitorChannelJsonRequests() {
    // Variable to store the latest channel ID
    let latestChannelID;

    // Create a new MutationObserver to monitor changes in the document
    const observer = new MutationObserver(() => {
      // Get all resource entries from the performance API
      const resourceEntries = performance.getEntriesByType("resource");

      // Loop through each resource entry
      for (const entry of resourceEntries) {
        const resourceURL = new URL(entry.name);

        // Check if the resource path is "/channel_json" and has the "id" search parameter
        if (
          resourceURL.pathname === "/channel_json" &&
          resourceURL.searchParams.has("id")
        ) {
          const channelID = resourceURL.searchParams.get("id");

          // If the channel ID is different from the latest one, update and log it
          if (channelID && channelID !== latestChannelID) {
            latestChannelID = channelID;
            console.log("Updated latest channel ID:", latestChannelID);
          }
        }
      }
    });

    // Start observing the document for changes in its child elements and subtree
    observer.observe(document, { childList: true, subtree: true });

    // Set an interval to periodically check the resource entries
    setInterval(() => {
      const resourceEntries = performance.getEntriesByType("resource");

      for (const entry of resourceEntries) {
        const resourceURL = new URL(entry.name);

        if (
          resourceURL.pathname === "/channel_json" &&
          resourceURL.searchParams.has("id")
        ) {
          const channelID = resourceURL.searchParams.get("id");

          if (channelID && channelID !== latestChannelID) {
            latestChannelID = channelID;
            console.log("Updated latest channel ID:", latestChannelID);
          }
        }
      }
    }, 5000); // 0x1388 in hexadecimal is 5000 in decimal
  }

  function fetchUserData() {
    console.log("Fetching user data...");
    if (isFetching) {
      handleAlreadyFetching();
      return;
    }
    const url = "https://emeraldchat.com/channel_json?id=" + latestChannelID;
    console.log("Fetching user data from:", url);
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
          DisplayUserSelection(users);
        } else {
          console.error("No users found in response:", data);
          showAlert("No users found", "warning");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        showAlert("Error fetching user data", "danger");
      });
  }

  const MenuButton = document.createElement("button");
  MenuButton.innerText = "C:\\EME Menu";
  MenuButton.style.cssText =
    "position:fixed;bottom:10px;right:10px;padding:8px 16px;background-color:#28a745;color:white;border:none;border-radius:8px;z-index:50;cursor:pointer;";
  document.body.appendChild(MenuButton);

  const ExecutorButton = document.createElement("button");
  ExecutorButton.innerText = "Executor";
  ExecutorButton.style.cssText =
    "position:fixed;bottom:10px;left:10px;padding:8px 16px;background-color:#dc3545;color:white;border:none;border-radius:8px;z-index:50;cursor:pointer;";
  document.body.appendChild(ExecutorButton);

  MenuButton.addEventListener("click", () => {
    console.log("Menu button clicked");
    if (isFetching) {
      handleAlreadyFetching();
    } else {
      fetchUserData();
    }
  });

  ExecutorButton.addEventListener("click", () => {
    console.log("Exploit button clicked");
    if (isFetching) {
      handleAlreadyFetching();
    } else {
      ShowScriptExecutor();
    }
  });
  function handleAlreadyFetching() {
    if (UserSelectionUI) {
      UserSelectionUI.remove();
      UserSelectionUI = null;
      isFetching = false;
      MenuButton.innerText = "C:\\EME Menu";
      MenuButton.style.backgroundColor = "#28a745";
      ExecutorButton.innerText = "Executor";
      ExecutorButton.style.backgroundColor = "#dc3545";
    }
  }
  function ShowScriptExecutor() {
    handleAlreadyFetching();
    const scriptExecutorContainer = document.createElement("div");
    scriptExecutorContainer.style.cssText =
      "background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.3);padding:32px;max-width:600px;width:100%;position:fixed;top:0;left:0;margin:16px;z-index:20;border-radius:8px;color:white;";
    scriptExecutorContainer.innerHTML =
      '\n            <h1 style="font-size:2rem;font-weight:bold;margin-bottom:24px;text-align:center;"></h1>\n            <p style="font-size:1rem;margin-bottom:32px;text-align:center;opacity:0.8;"></p>\n            <form id="script-form">\n                <textarea id="script-content" style="width:100%;padding:12px;background-color:#333;color:white;border-radius:8px;margin-bottom:16px;" rows="10" placeholder="Write your script here..."></textarea>\n                <button type="button" id="execute-script" style="width:100%;padding:12px;background:linear-gradient(to right, #007bff, #6610f2);color:white;border:none;border-radius:8px;transition:transform 0.3s ease-in-out;">Execute Script</button>\n            </form>\n        ';
    document.body.appendChild(scriptExecutorContainer);
    UserSelectionUI = scriptExecutorContainer;
    isFetching = true;
    ExecutorButton.innerText = "Close Executor";
    ExecutorButton.style.backgroundColor = "#c82333";
    document.getElementById("execute-script").addEventListener("click", () => {
      const scriptContent = document.getElementById("script-content").value;
      try {
        eval(scriptContent);
        console.log("User script executed successfully");
        log("Script executed successfully", "success");
      } catch (error) {
        console.error("Error executing script:", error);
        log("Error executing script", "danger");
      }
    });
  }
  function DisplayUserSelection(users) {
    console.log("Displaying user selection UI");
    handleAlreadyFetching();

    const userSelectionContainer = document.createElement("div");
    userSelectionContainer.style.cssText =
      "position:fixed;bottom:60px;right:10px;width:300px;background-color:#2c2c2c;color:white;box-shadow:0 4px 6px rgba(0,0,0,0.3);border-radius:8px;z-index:1001;max-height:400px;overflow-y:auto;padding:15px;";

    const title = document.createElement("h3");
    title.style.cssText =
      "text-align:center;margin-bottom:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    title.innerText = "Select a User";
    userSelectionContainer.appendChild(title);

    const userList = document.createElement("div");
    userList.style.marginBottom = "15px";

    users.forEach((user) => {
      const userItem = document.createElement("div");
      userItem.style.cssText =
        "padding:8px;margin-bottom:5px;background-color:#3c3c3c;border-radius:4px;cursor:pointer;";
      userItem.innerText = `${user.name} (${user.id})`;
      userItem.addEventListener("click", () =>
        handleUserSelection(user.id, user.name)
      );
      userList.appendChild(userItem);
    });

    userSelectionContainer.appendChild(userList);
    document.body.appendChild(userSelectionContainer);

    UserSelectionUI = userSelectionContainer;
    isFetching = true;
    MenuButton.innerText = "Close C:\\EME Menu";
    MenuButton.style.backgroundColor = "#c82333";
  }

  function handleUserSelection(userId, userName) {
    console.log("User selected: " + userName + " (ID: " + userId + ")");

    // Create the container for the user selection UI
    const userActionContainer = document.createElement("div");
    userActionContainer.style.cssText =
      "position:fixed;bottom:60px;right:10px;width:300px;background-color:#2c2c2c;color:white;box-shadow:0 4px 6px rgba(0,0,0,0.3);border-radius:8px;z-index:1001;padding:15px;";

    // Create the title element
    const title = document.createElement("h3");
    title.style.cssText =
      "text-align:center;margin-bottom:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    title.innerText = "User Actions";
    userActionContainer.appendChild(title);

    // Create the button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText =
      "display:flex;justify-content:space-between;";

    // Create the upvote button
    const upvoteButton = document.createElement("button");
    upvoteButton.style.cssText =
      "padding:8px 15px;border:none;border-radius:4px;cursor:pointer;font-size:14px;background-color:#28a745;color:white;";
    upvoteButton.innerText = "Upvote";
    upvoteButton.addEventListener("click", () => GiveKarma(userId, 1));
    buttonContainer.appendChild(upvoteButton);

    // Create the downvote button
    const downvoteButton = document.createElement("button");
    downvoteButton.style.cssText =
      "padding:8px 15px;border:none;border-radius:4px;cursor:pointer;font-size:14px;background-color:#ff0000;color:white;";
    downvoteButton.innerText = "Downvote";
    downvoteButton.addEventListener("click", () => GiveKarma(userId, -1));
    buttonContainer.appendChild(downvoteButton);

    // Append the button container to the main container
    userActionContainer.appendChild(buttonContainer);

    // Remove existing user selection UI if it exists
    if (UserSelectionUI) {
      UserSelectionUI.remove();
    }

    // Append the new user selection UI to the document body
    document.body.appendChild(userActionContainer);

    // Update global variables
    UserSelectionUI = userActionContainer;
    isFetching = true;
    MenuButton.innerText = "Close C:\\EME Menu";
    MenuButton.style.backgroundColor = "#c82333";
  }

  function GiveKarma(recipientId, polarityValue) {
    const karmaGiveURL =
      "https://emeraldchat.com/karma_give?id=" +
      recipientId +
      "&polarity=" +
      polarityValue;
    console.log(
      "Sending vote: User ID " + recipientId + ", Polarity " + polarityValue
    );
    console.log("Vote URL: " + karmaGiveURL);
    fetch(karmaGiveURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("Vote response status:", response.status);
        if (response.status === 0xcc) {
          console.log("Vote sent successfully");
          log("Vote sent successfully", "success");
        } else {
          console.error("Failed to send vote:", response.statusText);
          log("Failed to send vote", "danger");
        }
      })
      ["catch"]((_0x2a1112) => {
        console.error("Error sending vote:", _0x2a1112);
        log("Error sending vote", "danger");
      });
  }
  function log(message, type) {
    const notification = document.createElement("div");
    notification.style.cssText =
      "position:fixed;bottom:20px;right:20px;padding:15px;background-color:" +
      (type === "success"
        ? "#28a745"
        : type === "warning"
        ? "#ffc107"
        : "#dc3545") +
      ";color:white;border-radius:5px;z-index:1002;";
    notification.innerText = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  monitorChannelJsonRequests();
});
