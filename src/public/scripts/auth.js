const form = document.forms[0];
const error_message = document.getElementById("error_message");

form.addEventListener("click", async (e) => {
    let action = e.target.dataset.action;
    if (!action) return;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`/api/auth${action}`, {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ username, password })
    });
   
    const data = await res.json();
    if (data.success) {
        window.location.href = data.redirect;
    } else {
        error_message.textContent = data.errmsg;
    }
});