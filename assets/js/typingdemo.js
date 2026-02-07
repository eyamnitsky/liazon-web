examples = [["Iris, schedule a meeting for noon tomorrow.", "Scheduled a meeting for 12pm ET."],["Iris, schedule a meeting for us.", "Sure thing, provide your availability.", "Any time afternoon next week should work."]];

const usersaid = document.getElementById("usersaid");
const irissaid = document.getElementById("irissaid");
const usersaid2 = document.getElementById("usersaid2");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function startup() {
    await delay(1000);
}
let talking = 0;
let converex = 0;
let convertext = 0;
let nextexample = false;


async function typetext() {
    if (nextexample) {
        usersaid.innerHTML = "<br>";
        irissaid.innerHTML = "<br>";
        usersaid2.innerHTML = "<br>";
    }
    nextexample = false;
    if (talking == 0) { usersaid.innerHTML = "<br>"; }
    else if (talking == 1) { irissaid.innerHTML = "<br>"; }
    else { usersaid2.innerHTML = "<br>"; }
    for (let i = 0; i < examples[converex][convertext].length; i++) {
        if (talking == 0) {
            usersaid.innerHTML = (usersaid.innerHTML == "<br>") ? examples[converex][convertext][i] : usersaid.textContent + examples[converex][convertext][i];
        }
        else if (talking == 1) {
            irissaid.innerHTML = (irissaid.innerHTML == "<br>") ? examples[converex][convertext][i] : irissaid.textContent + examples[converex][convertext][i];
        }
        else {
            usersaid2.innerHTML = (usersaid2.innerHTML == "<br>") ? examples[converex][convertext][i] : usersaid2.textContent + examples[converex][convertext][i];
        }
        await delay(50);
    }
    if (convertext != examples[converex].length - 1) { convertext += 1; }
    else {
        convertext = 0;
        talking = -1;
        nextexample = true;
        if (converex != examples.length - 1) { converex += 1; }
        else {converex = 0;}
    }
    talking += 1
    setTimeout(typetext, 1500);
}

console.log("hkjlhlkhl")
typetext();