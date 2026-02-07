const examples = [
  [
    "Iris, can you find 30 minutes with Alice sometime next week?",
    "Sure — do you have any day or time preferences?"
  ],
  [
    "Iris, please schedule a quick sync with Alice.",
    "Got it. How long should it be?",
    "Let’s do 30 minutes."
  ],
  [
    "Iris, can you move tomorrow’s 2pm with Alice?",
    "No problem — should I look for something later this week?",
    "Yes, anything after Wednesday works."
  ],
  [
    "Iris, schedule a call with Alice when we’re both free.",
    "I’ll propose a few options and see what works best.",
    "Sounds good.",
    "Thursday morning works for me.",
    "Great — I’ll confirm Thursday morning and send the invite."
  ],
  [
    "Iris, can you coordinate a time with Alice this week?",
    "Sure — do you want me to prioritize speed or best overlap?",
    "Speed, please."
  ],
  [
    "Iris, please reschedule my meeting with Alice.",
    "Okay — same length and participants?",
    "Yes.",
    "I can’t do Friday anymore.",
    "Thanks — I’ll avoid Friday and propose new options."
  ],
  [
    "Iris, set up a 1:1 with Alice next week.",
    "Understood. Any days to avoid?",
    "Avoid Tuesday."
  ],
  [
    "Iris, can you handle scheduling with Alice without looping me back in?",
    "Yes — I’ll take it from here and confirm once it’s locked."
  ]
];


const usersaid = document.getElementById("usersaid");
const irissaid = document.getElementById("irissaid");
const user2said = document.getElementById("usersaid2");
const user2card = document.getElementById("usercard2");

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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typetext() {
    if (nextexample) {
        for (let i = 0; i < 20; i++) {
            usersaid.style.opacity -= 0.05;
            irissaid.style.opacity -= 0.05;
            user2said.style.opacity -= 0.05;
            if (examples[converex].length < 4) { user2card.style.opacity -= (user2card.style.opacity == 0) ? 0 : 0.05; } else { user2card.style.opacity += (user2card.style.opacity == 1) ? 0 : 0.5; }
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
findnewex();
if (examples[converex].length > 3) { user2card.style.opacity = 1; } else { user2card.style.opacity = 0; }
typetext();