const dialog = document.querySelector("dialog");

// buttons
const addfood_btn = document.getElementById("addfood_btn");
const cancel_btn = document.getElementById("cancel_btn");

// pseudo button
const foodlist = document.getElementById("foodlist");

// dialog elements
const dlg_title = document.getElementById("dialog_title");
const delete_btn = document.getElementById("delete_btn");

addfood_btn.addEventListener("click", () => {
    dlg_title.textContent = "Add New Food";
    delete_btn.style.visibility = "hidden";
    dialog.showModal();
});

foodlist.addEventListener("click", e => {
    const editfood_btn = e.target.closest(".editfood_btn");
    if (editfood_btn) {
        dlg_title.textContent = "Edit Your Food";
        delete_btn.style.visibility = "visible";
        dialog.showModal();
    }
});

cancel_btn.addEventListener("click", () => {
    dialog.close();
    addfood_btn.blur();
});