const examples = [
["Iris, schedule a meeting for noon tomorrow.", "Scheduled a meeting for 12pm ET."],
["Iris, schedule a meeting for us.", "Sure thing, provide your availability.", "Any time afternoon next week should work.", "Tuesday or Wednesday after 3pm works for me.", "Great, I scheduled a meeting for Wednesday, at 3pm."],
["Iris, schedule a meeting on Monday around 2ish.","Please clarify: 2am or 2pm?","2pm.","Works for me!","Scheduled a meeting for 2pm ET."]
];

const usersaid = document.getElementById("usersaid");
const irissaid = document.getElementById("irissaid");
const user2said = document.getElementById("usersaid2");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function startup() {
    await delay(500);
}
startup();
let talking = 0;
let converex = 0;
let convertext = 0;
let nextexample = false;
let doneex = [];

function findnewex() {
    do {
        converex = Math.floor(Math.random() * examples.length);
    } while (doneex.includes(converex));
}

findnewex();


async function typetext() {
    if (nextexample) {
        for (let i = 0; i < 20; i++) {
            usersaid.style.opacity -= 0.05;
            irissaid.style.opacity -= 0.05;
            user2said.style.opacity -= 0.05;
            await delay(50);
        }
        usersaid.innerHTML = "<br>";
        irissaid.innerHTML = "<br>";
        user2said.innerHTML = "<br>";
        await delay(1000);
    }
    usersaid.style.opacity = 1;
    irissaid.style.opacity = 1;
    user2said.style.opacity = 1;
    nextexample = false;
    if (talking == 0) { usersaid.innerHTML = "<br>"; }
    else if (talking == 1) { irissaid.innerHTML = "<br>"; }
    else if (talking == 2) { usersaid.innerHTML = "<br>"; }
    else if (talking == 3) { user2said.innerHTML = "<br>"; }
    else { irissaid.innerHTML = "<br>"; }
    for (let i = 0; i < examples[converex][convertext].length; i++) {
        if (talking == 0) {
            usersaid.innerHTML = (usersaid.innerHTML == "<br>") ? examples[converex][convertext][i] : usersaid.textContent + examples[converex][convertext][i];
        }
        else if (talking == 1) {
            irissaid.innerHTML = (irissaid.innerHTML == "<br>") ? examples[converex][convertext][i] : irissaid.textContent + examples[converex][convertext][i];
            if (examples[converex].length > 2) { usersaid.style.opacity -= 1/examples[converex][convertext].length; }
        }
        else if (talking == 2) {
            usersaid.innerHTML = (usersaid.innerHTML == "<br>") ? examples[converex][convertext][i] : usersaid.textContent + examples[converex][convertext][i];
        }
        else if (talking == 3) {
            user2said.innerHTML = (user2said.innerHTML == "<br>") ? examples[converex][convertext][i] : user2said.textContent + examples[converex][convertext][i];
            if (examples[converex].length > 4) { irissaid.style.opacity -= 1/examples[converex][convertext].length; }
        }
        else {
            irissaid.innerHTML = (irissaid.innerHTML == "<br>") ? examples[converex][convertext][i] : irissaid.textContent + examples[converex][convertext][i];
        }
        await delay(50);
    }
    if (convertext != examples[converex].length - 1) {
        convertext += 1;
        if (talking == 1) { usersaid.innerHTML = "<br>"; }
        else if (talking == 3) { irissaid.innerHTML = "<br>"; }
    }
    else {
        convertext = 0;
        talking = -1;
        nextexample = true;
        doneex.push(converex);
        if (doneex.length == examples.length) { doneex = [converex]; }
        findnewex();
    }
    talking += 1
    setTimeout(typetext, 1500);
}
typetext();