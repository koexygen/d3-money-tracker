const form = document.querySelector("form");
const name = document.getElementById("name");
const cost = document.getElementById("cost");
const error = document.getElementById("error");

function errorStyle(type) {
  switch (type) {
    case "success":
      error.className = "green-text";
      error.textContent = "Your expense added :)";
      break;
    case "NaN":
      error.className = "red-text";
      error.textContent = "Cost should be number";
      cost.value = "";
      break;

    case "not-filled":
      error.className = "red-text";
      error.textContent = "You should fill all information";
      break;
    default:
      break;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (name.value && cost.value) {
    if (isNaN(parseInt(cost.value))) {
      errorStyle("NaN");
      return;
    }

    const doc = {
      name: name.value,
      cost: parseInt(cost.value),
    };

    db.collection("expenses")
      .add(doc)
      .then((resp) => {
        name.value = "";
        cost.value = "";

        errorStyle("success");
      });
  } else {
    errorStyle("not-filled");
  }
});
