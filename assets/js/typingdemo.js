examples = [["Something, meeting, something...", "Scheduling and stuff...","This is sample text!", "I know!"]];

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
    usersaid.textContent = ""
    for (let i = 0; i < examples[converex][convertext].length; i++) {
        if (talking == 0) { usersaid.textContent += examples[converex][convertext][i]; }
        else { irissaid.textContent += examples[converex][convertext][i]; }
        await delay(100);
    }
    setTimeout(typetext, 1000);
}

console.log("hkjlhlkhl")
typetext();