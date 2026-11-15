const loginOptionsCancelContainer = document.getElementById(
  "loginOptionCancelContainer"
);
const loginOptionMicrosoft = document.getElementById("loginOptionMicrosoft");
// const loginOptionMojang = document.getElementById('loginOptionMojang')
const loginOptionsCancelButton = document.getElementById(
  "loginOptionCancelButton"
);

let loginOptionsCancellable = false;

let loginOptionsViewOnLoginSuccess;
let loginOptionsViewOnLoginCancel;
let loginOptionsViewOnCancel;
let loginOptionsViewCancelHandler;
// --- Đăng nhập bằng tài khoản Web ---
const btnWeb = document.getElementById("loginOptionWeb");
const webForm = document.getElementById("webLoginForm");
const btnWebConfirm = document.getElementById("webLoginConfirm");
const btnWebBack = document.getElementById("webLoginBack");
function loginOptionsCancelEnabled(val) {
  if (val) {
    $(loginOptionsCancelContainer).show();
  } else {
    $(loginOptionsCancelContainer).hide();
  }
}

loginOptionMicrosoft.onclick = (e) => {
  switchView(getCurrentView(), VIEWS.waiting, 500, 500, () => {
    ipcRenderer.send(
      MSFT_OPCODE.OPEN_LOGIN,
      loginOptionsViewOnLoginSuccess,
      loginOptionsViewOnLoginCancel
    );
  });
};

// loginOptionMojang.onclick = (e) => {
//     switchView(getCurrentView(), VIEWS.login, 500, 500, () => {
//         loginViewOnSuccess = loginOptionsViewOnLoginSuccess
//         loginViewOnCancel = loginOptionsViewOnLoginCancel
//         loginCancelEnabled(true)
//     })
// }

loginOptionsCancelButton.onclick = (e) => {
  switchView(getCurrentView(), loginOptionsViewOnCancel, 500, 500, () => {
    // Clear login values (Mojang login)
    // No cleanup needed for Microsoft.
    loginUsername.value = "";
    loginPassword.value = "";
    if (loginOptionsViewCancelHandler != null) {
      loginOptionsViewCancelHandler();
      loginOptionsViewCancelHandler = null;
    }
  });
};

if (btnWeb) {
  btnWeb.addEventListener("click", () => {
    document.querySelector(".loginOptionActions").style.display = "none";
    webForm.style.display = "block";
  });
}

if (btnWebBack) {
  btnWebBack.addEventListener("click", () => {
    webForm.style.display = "none";
    document.querySelector(".loginOptionActions").style.display = "block";
  });
}

if (btnWebConfirm) {
  btnWebConfirm.addEventListener("click", async () => {
    const email = document.getElementById("webLoginEmail").value;
    const password = document.getElementById("webLoginPassword").value;

    // if (emailInput && passwordInput) {
    //   [emailInput, passwordInput].forEach((input) => {
    //     input.addEventListener("keypress", (e) => {
    //       if (e.key === "Enter") {
    //         e.preventDefault();
    //         btnWebConfirm.click();
    //       }
    //       btnWebConfirm.click();
    //     });
    //   });
    // }
    if (!email || !password) {
      showOverlayMessage(
        "Thiếu thông tin",
        "Vui lòng nhập email và mật khẩu!",
        true
      );
      return;
    }

    try {
      const res = await fetch("http://13.212.254.137/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Sai thông tin đăng nhập.");
      }

      const account = {
        uuid: data.data.userId,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        displayName: data.data.displayName,
        type: "web",
      };
      ConfigManager.addAuthAccount(account.uuid, account);
      ConfigManager.setSelectedAccount(account.uuid);
      ConfigManager.save();
      updateSelectedAccount(account);

      showOverlayMessage("Thành công", `Chào mừng ${data.data.displayName}!`)
      switchView(VIEWS.loginOptions, VIEWS.landing);
    } catch (err) {
      showOverlayMessage("Đăng nhập thất bại", err.message, true)
      console.error("[WebLogin]", err);
    }
  });
}

function showOverlayMessage(title, message, isError = false) {
  setOverlayContent(title, message, "Đóng");
  if (isError) {
    document.querySelector("#overlayDismiss").style.background = "#e74c3c";
  } else {
    document.querySelector("#overlayDismiss").style.background = "#2ecc71";
  }
  setOverlayHandler(() => toggleOverlay(false));
  toggleOverlay(true);
}
