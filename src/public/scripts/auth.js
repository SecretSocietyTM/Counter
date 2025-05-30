const authForm = document.forms[0];

authForm.addEventListener("click", async (e) => {

    let action = e.target.dataset.action

    if (!action) {
        return;
    }

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!authForm.checkValidity()) {
        authForm.reportValidity();
        return;
    }

    const res = await fetch(action, {
       method: "POST",
       headers: { "Content-Type" : "application/json" },
       body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.success) {
        window.location.href = data.redirectURL;
    } else {
        alert(data.message);
        // TODO: replace this with something else down the line
    }
});