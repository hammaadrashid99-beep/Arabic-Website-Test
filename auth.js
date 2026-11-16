
(() => {
  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error("Supabase client not found.");
    return;
  }

  const nav = document.getElementById("nav");

  if (!nav) {
    console.error("Navigation element not found.");
    return;
  }

  let mode = "login";
  let session = null;

  // Add account styling
  const style = document.createElement("style");
  style.textContent = `
    .account-modal-bg {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.75);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 20px;
    }

    .account-modal {
      background: #171b19;
      color: #f5f2eb;
      border: 1px solid #343b37;
      border-radius: 18px;
      padding: 28px;
      width: 100%;
      max-width: 410px;
      position: relative;
    }

    .account-modal h2 {
      margin: 0 0 8px;
    }

    .account-modal p {
      color: #aaa;
      font-size: 14px;
      line-height: 1.5;
    }

    .account-modal input {
      width: 100%;
      box-sizing: border-box;
      padding: 13px;
      margin: 7px 0 16px;
      background: #101412;
      color: white;
      border: 1px solid #444;
      border-radius: 9px;
      font-size: 15px;
    }

    .account-modal label {
      font-size: 13px;
      color: #ccc;
    }

    .account-primary {
      width: 100%;
      padding: 13px;
      border: 0;
      border-radius: 30px;
      background: #e75e40;
      color: white;
      font-weight: bold;
      cursor: pointer;
      font-size: 15px;
    }

    .account-secondary {
      background: none;
      border: 0;
      color: #e98a70;
      cursor: pointer;
      padding: 12px;
    }

    .account-close {
      position: absolute;
      top: 14px;
      right: 17px;
      background: none;
      border: 0;
      color: #aaa;
      font-size: 24px;
      cursor: pointer;
    }

    .account-status {
      font-size: 13px;
      margin-top: 14px;
      color: #e9a18d;
    }
  `;
  document.head.appendChild(style);

  // Account button
  const accountButton = document.createElement("button");
  accountButton.className = "gear-nav";
  accountButton.textContent = "Log in";
  accountButton.type = "button";
  accountButton.addEventListener("click", openModal);
  nav.appendChild(accountButton);

  // Modal
  const modal = document.createElement("div");
  modal.className = "account-modal-bg";

  modal.innerHTML = `
    <div class="account-modal">
      <button class="account-close" type="button">×</button>

      <h2 id="account-title">Welcome back</h2>
      <p id="account-description">
        Log in to synchronise your Arabic learning progress.
      </p>

      <div id="account-form-area">
        <form id="account-form">
          <label for="account-email">Email address</label>
          <input id="account-email"
            type="email"
            autocomplete="email"
            required>

          <label for="account-password">Password</label>
          <input id="account-password"
            type="password"
            autocomplete="current-password"
            minlength="8"
            required>

          <button class="account-primary" id="account-submit"
            type="submit">Log in</button>
        </form>

        <button class="account-secondary"
          id="account-switch" type="button">
          Don't have an account? Sign up
        </button>
      </div>

      <div id="account-status" class="account-status"
        role="status" aria-live="polite"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const title = modal.querySelector("#account-title");
  const description = modal.querySelector("#account-description");
  const formArea = modal.querySelector("#account-form-area");
  const form = modal.querySelector("#account-form");
  const emailInput = modal.querySelector("#account-email");
  const passwordInput = modal.querySelector("#account-password");
  const submit = modal.querySelector("#account-submit");
  const switchButton = modal.querySelector("#account-switch");
  const status = modal.querySelector("#account-status");

  function showStatus(message) {
    status.textContent = message;
  }

  function updateButton() {
    accountButton.textContent = session
      ? "My account"
      : "Log in";
  }

  function openModal() {
    modal.style.display = "flex";
    status.textContent = "";

    if (session) {
      title.textContent = "Your account";
      description.textContent =
        "You are signed in as " + session.user.email;

      formArea.innerHTML = `
        <button class="account-primary"
          id="account-logout" type="button">
          Log out
        </button>
      `;

      modal.querySelector("#account-logout")
        .addEventListener("click", async () => {
          const { error } = await supabase.auth.signOut();

          if (error) {
            showStatus(error.message);
          } else {
            modal.style.display = "none";
          }
        });

      return;
    }

    mode = "login";
    renderForm();
  }

  function renderForm() {
    title.textContent =
      mode === "login" ? "Welcome back" : "Create your account";

    description.textContent =
      mode === "login"
        ? "Log in to synchronise your Arabic learning progress."
        : "Create an account to save your learning progress across devices.";

    submit.textContent =
      mode === "login" ? "Log in" : "Create account";

    switchButton.textContent =
      mode === "login"
        ? "Don't have an account? Sign up"
        : "Already have an account? Log in";

    passwordInput.autocomplete =
      mode === "login" ? "current-password" : "new-password";

    showStatus("");
  }

  switchButton.addEventListener("click", () => {
    mode = mode === "login" ? "signup" : "login";
    renderForm();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    submit.disabled = true;
    submit.textContent = "Please wait...";
    showStatus("");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:"https://hammaadrashid99-beep.github.io/Arabic-Website-Test/"
          }
        });

        if (error) throw error;

        if (!data.session) {
          showStatus(
            "Account created! Please check your email to confirm your address."
          );
        } else {
          showStatus("Account created successfully!");
        }
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (error) throw error;

        modal.style.display = "none";
      }
    } catch (error) {
      showStatus(error.message);
    } finally {
      submit.disabled = false;
      submit.textContent =
        mode === "login" ? "Log in" : "Create account";
    }
  });

  modal.querySelector(".account-close")
    .addEventListener("click", () => {
      modal.style.display = "none";
    });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Track authentication changes
supabase.auth.onAuthStateChange((_event, newSession) => {
  session = newSession;
  window.arabicSession = newSession;

  window.dispatchEvent(
    new CustomEvent("arabic-auth-change", {
      detail: newSession
    })
  );

  updateButton();
});

  // Restore existing session
supabase.auth.getSession().then(({ data }) => {
  session = data.session;
  window.arabicSession = session;

  window.dispatchEvent(
    new CustomEvent("arabic-auth-change", {
      detail: session
    })
  );

  updateButton();
});
})();
