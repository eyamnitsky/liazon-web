const form = document.querySelector("#contact-form");
const note = document.querySelector("#form-note");

if (form && note) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.elements["name"].value.trim();

    if (!name) {
      note.textContent = "Please add your name so we know how to address you.";
      return;
    }

    note.textContent = "Thanks, we have received your request.";
    form.reset();
  });
}
