examples = [["Iris, schedule a meeting for noon tomorrow", "Scheduled a meeting for 12pm ET"],["Iris, schedule a meeting for us", "Sure thing, provide your availability", "Any time afternoon next week should work"]];

const usersaid = document.getElementById("usersaid");
const irissaid = document.getElementById("irissaid");

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function startup() {
    await delay(1000);
}
let talking = 0;
let converex = 0;
let convertext = 0;


async function typetext() {
    if (talking == 0) { usersaid.textContent = ""; }
    else { irissaid.textContent = ""; }
    for (let i = 0; i < examples[converex][convertext].length; i++) {
        if (talking == 0) { usersaid.textContent += examples[converex][convertext][i]; }
        else { irissaid.textContent += examples[converex][convertext][i]; }
        await delay(100);
    }
    if (convertext != examples[converex].length - 1) { convertext += 1; }
    else {
        convertext = 0;
        
        if (converex != examples.length - 1) { converex += 1; }
        else {converex = 0;}
    }
    talking = (talking + 1) % 2
    setTimeout(typetext, 1000);
}

console.log("hkjlhlkhl")
typetext();