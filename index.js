const form = document.querySelector("form");
const name = document.getElementById("name");
const cost = document.getElementById("cost");
const error = document.getElementById("error");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (name.value && cost.value) {
    const doc = {
      name: name.value,
      cost: parseInt(cost.value),
    };

    db.collection("expenses")
      .add(doc)
      .then((resp) => {
        name.value = "";
        cost.value = "";

        error.className = "green-text";
        error.textContent = "Your expense added :)";
      });
  } else {
    error.className = "red-text";
    error.textContent = "Please fill information";
  }
});
