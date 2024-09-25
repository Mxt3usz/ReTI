function addLines(length) {
    const code = document.querySelector("#lines");
    code.innerHTML = "";
    for (let i = 0; i < length; i++) {
        code.innerHTML += `<span></span>`;
    }
}
addLines(29);
let original_height = document.querySelector("#query").getBoundingClientRect().height;
document.querySelector("#query").addEventListener("keyup", function() {
    const length = this.value.split("\n").length;
    if (length >= 29)
    {
    addLines(length);
    this.style.height = original_height + 15 * (length - 29) + "px";
    }
});

// Function to simulate delay
function delay(ms) {
    // promise for await to work
    return new Promise(resolve => setTimeout(resolve, ms));
}
let relations = {"<":(a,b)=>a<b, "<=":(a,b)=>a<=b, "==":(a,b)=>a==b, ">":(a,b)=>a>b, ">=":(a,b)=>a>=b, "!=":(a,b)=>a!=b};
let compute_op = {"ADD":(a,b)=>a+b, "SUB":(a,b)=>a-b, "MUL":(a,b)=>a*b, "DIV":(a,b)=>Math.floor(a / b),
     "MOD":(a,b)=>a%b, "OPLUS":(a,b)=>a^b, "OR":(a,b)=>a|b, "AND":(a,b)=>a&b};
let uart = document.querySelector("#uart");
let eprom = document.querySelector("#eprom");
let sram = document.querySelector("#sram");
let isr1 = { 1000: "SUBI SP 7", 1001: "STOREIN SP IN1 7", 1002: "STOREIN SP IN2 6", 1003: "STOREIN SP ACC 5",
    1004: "STOREIN SP PC 4", 1005: "STOREIN SP IVN 3", 1006: "STOREIN SP BAF 2", 1007: "STOREIN SP CS 1",
    1008: "STOREIN SP DS 0", 1009: "LOADI IN1 0", 1010: "LOADI IN2 0", 1011: "ADDI SP 7",1012: "RTI" };
//create sram table
for (let i = 0; i < 1100; i++) {
    if (i < 5) // IVT Table
    {
        sram.innerHTML += `<div class="memory-entry">${1000 + 20 * i}</div>`;
    }
    else if (i >= 1000 && i <= 1012) // ISR 1
    {
        sram.innerHTML += `<div class="memory-entry">${isr1[i]}</div>`;
    }
    else
    {
        sram.innerHTML += `<div class="memory-entry"></div>`;
    }
}
// Function to execute a single RETI operation
async function executeOperation(operation, delayTime, normalbetrieb, registers) {
    console.log(`Executing: ${operation}`);
    operation = operation.split(" ");  // split the operation into parts
    if (operation.length == 0 || operation.length > 4) { // no operation given or too many parts
        return [false, normalbetrieb];
    }
        switch (operation[0]) { 
            case "LOAD":
                if (operation.length != 3 || !(operation[1] in registers) || isNaN(operation[2]) || isNaN(sram.children[parseInt(operation[2])].innerHTML)) {
                    return [false, normalbetrieb];
                }
                registers[operation[1]] = parseInt(sram.children[parseInt(operation[2])].innerHTML) // LOAD D M<i> (D = M<i>)
                break;
            case "LOADIN": // last check is to make sure in sram there is a number
                if (operation.length != 4 || !(operation[1] in registers) || !(operation[2] in registers) || isNaN(operation[3]) || isNaN(sram.children[registers[operation[1]] + parseInt(operation[3])].innerHTML)) 
                    {
                    return [false, normalbetrieb];
                }
                registers[operation[2]] = sram.children[registers[operation[1]] + parseInt(operation[3])].innerHTML; // LOADIN S D i (D = M<S+i>)
                break;
            case "LOADI":
                if (operation.length != 3 || !(operation[1] in registers) || isNaN(operation[2])) { 
                    return [false, normalbetrieb]; // isNan checks if the value is not a number
                }
                registers[operation[1]] = parseInt(operation[2]); // LOADI D i (D = i)
                break;
            case "STORE":
                if (operation.length != 3 || !(operation[1] in registers) || isNaN(operation[2])) {
                    return [false, normalbetrieb];
                }
                sram.children[parseInt(operation[2])].innerHTML = registers[operation[1]]; // STORE S i (M<i> = S)
                break;
            case "STOREIN":
                if (operation.length != 4 || !(operation[1] in registers) || !(operation[2] in registers) || isNaN(operation[3])) {
                    return [false, normalbetrieb];
                }
                sram.children[registers[operation[1]] + parseInt(operation[3])].innerHTML = registers[operation[2]];   // STOREIN D S i (M<D+i> = S)
                break;
            case "MOVE":
                if (operation.length != 3 || !(operation[1] in registers) || !(operation[2] in registers)) {
                    return [false, normalbetrieb];
                }
                registers[operation[2]] = registers[operation[1]]; // MOVE D S (D = S)
                break;
            case "NOP":
                break;
            case "JUMP":
                console.log(registers);
                if (operation.length == 2 && !isNaN(operation[1])) {
                    registers["PC"] = registers["PC"] + parseInt(operation[1]) - 1; // JUMP i (PC = PC + i)
                }
                else if (operation.length == 3 && operation[1] in relations && !isNaN(operation[2])) {
                    if (relations[operation[1]](registers["ACC"], 0)) {
                        registers["PC"] = registers["PC"] + parseInt(operation[2]) - 1; // JUMP R i (IF ACC R 0 THEN PC = PC + i ELSE PC = PC + 1)
                    }
                }
                else {
                    return [false, normalbetrieb];
                }
                break;
            case "INT":
                if (operation.length != 2 || isNaN(operation[1])) {
                    return [false, normalbetrieb];
                }
                registers["IVN"] = parseInt(operation[1]); // INT i (IVN = i)
                registers["SP"] = registers["SP"] - 1; // free up space in the stack
                sram.children[registers["SP"] + 1].innerHTML = registers["PC"]; // push PC to the stack
                registers["PC"] = parseInt(sram.children[registers["IVN"]].innerHTML) - 1; // PC = M<IVN> /Begin executing the interruptservice routine, -1 since otherwise first instruction is skipped (basically PCLoad signal)
                normalbetrieb = 0;
                break;
            case "RTI":
                if (operation.length != 1) {
                    return [false, normalbetrieb];
                }
                registers["PC"] = sram.children[registers["SP"] + 1].innerHTML; // pop PC from the stack
                registers["SP"] = registers["SP"] + 1; // free up space in the stack
                normalbetrieb = 1;
                break;
            default:
                if (operation[0].endsWith("I") && operation[0].slice(0,-1) in compute_op) { // compute immediate
                    if (operation.length != 3 || !(operation[1] in registers) || isNaN(operation[2])) {
                        return [false,  normalbetrieb];
                    }
                    // e.g. ADDI D i (D = D + i)
                    registers[operation[1]] = compute_op[operation[0].slice(0,-1)](registers[operation[1]], parseInt(operation[2]));
                }
                else if (operation[0] in compute_op) { // compute
                    if (operation.length != 3 || !(operation[1] in registers)) {
                        return [false, normalbetrieb];
                    }
                    if (!isNaN(operation[2]) && !isNaN(sram.children[operation[2]].innerHTML) ) { // e.g. ADD D M<i> (D = D + M<i>)
                        registers[operation[1]] = compute_op[operation[0]](registers[operation[1]], sram.children[operation[2]].innerHTML);
                    }
                    else if (operation[2] in registers) { // e.g. ADD S D (D = D + S)
                        registers[operation[1]] = compute_op[operation[0]](registers[operation[1]], registers[operation[2]]);
                    }
                    else {
                        return [false, normalbetrieb];
                    }
                }
                else {
                    return  [false, normalbetrieb];
                }
    }
    return [true, normalbetrieb];
}
// Function to run the RETI code
async function run() {
    // registers
    let registers = {"IVN":0,"PC":5, "IN1":0, "IN2":0, 
    "ACC":0, "SP":512, "BAF":0, "CS":0, "DS":0};
    let code = document.querySelector("#query").value;
    let lines = code.split("\n");
    let NB = 1;
    // save code to sram
    for (let i = 0; i < lines.length; i++) {
        // shifted by 5 to avoid overwriting the IVT table
        sram.children[i+5].innerHTML = lines[i];
    }
    while (registers["PC"] < lines.length + 5 || NB == 0) {
        // fetch phase
        let log = document.querySelector("#log");
        log.innerHTML = "INSTRUCTION " + registers["PC"].toString().padStart(3, ' ') + ": " + 
        (sram.children[[registers["PC"]]].innerHTML + " FETCH PHASE").padStart(20, ' ');
        // reserve 5 characters for each register
        log.innerHTML += "<br><br>REGISTERS: " + 
        "IVN: " + registers["IVN"].toString().padStart(5, ' ') + 
        " | PC: " + registers["PC"].toString().padStart(5, ' ') + 
        " | IN1: " + registers["IN1"].toString().padStart(5, ' ') + 
        " | IN2: " + registers["IN2"].toString().padStart(5, ' ') + 
        " | ACC: " + registers["ACC"].toString().padStart(5, ' ') + 
        " | SP: " + registers["SP"].toString().padStart(5, ' ') + 
        " | BAF: " + registers["BAF"].toString().padStart(5, ' ') + 
        " | CS: " + registers["CS"].toString().padStart(5, ' ') + 
        " | DS: " + registers["DS"].toString().padStart(5, ' '); 
        // await so setTimeout doesnt freeze the browser
        // when promise is resolved, the function continues
        await delay(1000);
        // execute phase
        let result = await executeOperation(sram.children[[registers["PC"]]].innerHTML, 1000, NB, registers);
        NB = result[1];
        if (!result[0]) {
            console.log("Invalid operation");
            break;
        }
        registers["PC"]++;
        log.innerHTML = "INSTRUCTION " + registers["PC"].toString().padStart(3, ' ') + ": " + 
        (sram.children[[registers["PC"]]].innerHTML + " EXECUTE PHASE").padStart(20, ' ');
        log.innerHTML += "<br><br>REGISTERS: " + 
        "IVN: " + registers["IVN"].toString().padStart(5, ' ') + 
        " | PC: " + registers["PC"].toString().padStart(5, ' ') + 
        " | IN1: " + registers["IN1"].toString().padStart(5, ' ') + 
        " | IN2: " + registers["IN2"].toString().padStart(5, ' ') + 
        " | ACC: " + registers["ACC"].toString().padStart(5, ' ') + 
        " | SP: " + registers["SP"].toString().padStart(5, ' ') + 
        " | BAF: " + registers["BAF"].toString().padStart(5, ' ') + 
        " | CS: " + registers["CS"].toString().padStart(5, ' ') + 
        " | DS: " + registers["DS"].toString().padStart(5, ' '); 
        await delay(1000);
        }
}

let reti = document.querySelector("#canvas");
reti.width = window.innerWidth;
reti.height = window.innerHeight;
reti = reti.getContext("2d");

function drawDriver(x, y) {
    reti.moveTo(x-18, y);
    reti.lineTo(x+18, y);
    reti.lineTo(x,y+25);
    reti.lineTo(x-18, y);
}

function drawReti(fetch) {
reti.clearRect(0, 0, reti.width, reti.height);
// DI Bus
reti.lineWidth = 3;
reti.beginPath();
reti.moveTo(0, 18);
reti.lineTo(686, 18);
// D Bus
reti.moveTo(711, 18);
reti.lineTo(1500, 18);
// L Bus
reti.moveTo(30, 301);
reti.lineTo(745, 301);
// R Bus
reti.moveTo(771, 301);
reti.lineTo(980, 301);
// A Bus
reti.moveTo(0, 437);
reti.lineTo(1500, 437);
reti.stroke();

reti.lineWidth = 2;
let offset_y = 0;
let offset_x = 0;
reti.beginPath();
// L to alu and R to alu
reti.moveTo(720.5, 302);
reti.lineTo(720.5, 320);
reti.moveTo(795.5, 320);
reti.lineTo(795.5, 302);
// alu
reti.moveTo(720.5-30, 321);
reti.lineTo(720.5+25, 321);
reti.moveTo(720.5-30, 321);
reti.lineTo(730, 380);
reti.moveTo(730, 380);
reti.lineTo(790, 380);
reti.lineTo(825.5 , 321);
reti.lineTo(770, 321);
reti.lineTo(759, 340);
reti.lineTo(746, 320.5);
// alu to aluad
reti.moveTo(759.5, 381);
reti.lineTo(759.5, 400);
//aluad
drawDriver(759.5, 401);
// aluad to A bus
reti.moveTo(759.5, 426);
reti.lineTo(759.5, 436);
// line for 0^32
reti.moveTo(42.5, 265);
reti.lineTo(42.5, 245);
// 0ld
drawDriver(42.5, 266);
// 0ld to L bus
reti.moveTo(42.5, 291);
reti.lineTo(42.5, 300);
// ddld
reti.moveTo(710.5, 1);
reti.lineTo(710.5, 36);
reti.lineTo(685.5, 18);
reti.lineTo(710.5, 1);
//aludid to DI bus
reti.moveTo(19.5, 19);
reti.lineTo(19.5, 300);
//aluid to ALU
reti.moveTo(19.5, 326);
reti.lineTo(19.5, 391);
reti.lineTo(759, 391);
//aludid
reti.moveTo(19.5-18, 325);
reti.lineTo(19.5+18, 325);
reti.lineTo(19.5, 300);
reti.lineTo(19.5-18, 325);
//pc to pcad
reti.moveTo(100.5, 100);
reti.lineTo(75.5, 100);
reti.lineTo(75.5, 340);
//pcad
drawDriver(75.5, 340);
//pcad to A bus
reti.moveTo(75.5, 365);
reti.lineTo(75.5, 436);
// DI bus to IVN
reti.moveTo(55.5, 19);
reti.lineTo(55.5, 68);
// IVN
reti.strokeRect(55.5 - 25, 68, 50, 25);
// IVN to ivld
reti.moveTo(55.5, 93);
reti.lineTo(55.5, 165);
// ivld
drawDriver(55.5, 166);
// ivld to L bus
reti.moveTo(55.5, 191);
reti.lineTo(55.5, 240);
reti.lineTo(65.5, 240);
reti.lineTo(65.5, 300);
for (let x = 100.5; x <= 740; x += 80) {
  // DI bus to registers
  reti.moveTo(x, 19);
  reti.lineTo(x, 35);
  // registers 
  reti.strokeRect(x-25, 36, 50, 25);
  // register to [reg]ld
  reti.moveTo(x, 62);
  reti.lineTo(x, 265);
  // [reg]ld
  drawDriver(x, 266);
  // register to [reg]dd
  reti.moveTo(x, 241 - offset_y);
  reti.lineTo(x+24, 241 - offset_y);
  // [reg]dd to D bus
  reti.moveTo(x+51, 241 - offset_y);
  reti.lineTo(x+750-offset_x, 241 - offset_y);
  reti.moveTo(x+750-offset_x, 241 - offset_y);
  reti.lineTo(x+750-offset_x, 19);
  // [reg]ld to L bus
  reti.moveTo(x+0.1, 291);
  reti.lineTo(x+0.1, 300);
  // [reg]dd
  reti.moveTo(x+25, 241 - offset_y - 18);
  reti.lineTo(x+25, 241 - offset_y + 18);
  reti.lineTo(x+50, 241 - offset_y);
  reti.lineTo(x+25, 241 - offset_y - 18);
  offset_y += 23;
  offset_x += 97;
}
// R bus drivers, transition and registers
for (let x = 780.5; x <= 1020; x += 60) 
{
// 0rd ird drd to R bus
drawDriver(x, 266);
reti.moveTo(x+0.1, 291);
reti.lineTo(x+0.1, 300);
}
//ic up line
reti.moveTo(780.5, 265);
reti.lineTo(780.5, 250);
// 0rd up line
reti.moveTo(840.5, 265);
reti.lineTo(840.5, 250);
// I to ird
reti.moveTo(900.5, 265);
reti.lineTo(900.5, 62);
// I reg
reti.strokeRect(900.5-25, 36, 50, 25);
// D bus to I
reti.moveTo(900.5, 19);
reti.lineTo(900.5, 35);
// D to drd
reti.moveTo(960.5, 265);
reti.lineTo(960.5, 19);
// I to Iad
reti.moveTo(900.5, 100);
reti.lineTo(925.5, 100);
reti.lineTo(925.5, 340);
// Iad
drawDriver(925.5, 340);
// Iad to A bus
reti.moveTo(925.5, 365);
reti.lineTo(925.5, 436);

// UART, EPROM, SRAM
for (let x = 1065.5; x <= 1585.5; x += 170) 
{
    // A to driver
    reti.moveTo(x, 436);
    reti.lineTo(x, 406);
    //driver
    reti.moveTo(x - 18, 406);
    reti.lineTo(x + 18, 406);
    reti.lineTo(x, 381);
    reti.lineTo(x - 18, 406);
    // UART, EPROM, SRAM
    reti.strokeRect(x -77, 86, 155, 270);
    // driver to UART, EPROM, SRAM
    reti.moveTo(x, 381);
    reti.lineTo(x, 357);
}
// UART to dud
reti.moveTo(1065.5, 86);
reti.lineTo(1065.5, 76);
reti.lineTo(1035.5, 76);
reti.lineTo(1035.5, 66);
// dud
drawDriver(1035.5, 41);
// dud to D bus
reti.moveTo(1035.5, 41);
reti.lineTo(1035.5, 19);
// UART to udd
reti.moveTo(1065.5, 76);
reti.lineTo(1075.5, 66);
// udd
reti.moveTo(1075.5-18, 66);
reti.lineTo(1075.5+18, 66);
reti.lineTo(1075.5, 41);
reti.lineTo(1075.5-18, 66);
// udd to D bus
reti.moveTo(1075.5, 41);
reti.lineTo(1075.5, 19);
// udd 0^32
reti.moveTo(1075.5, 66);
reti.lineTo(1085.5, 76);
// EPROM to edd
reti.moveTo(1235.5, 86);
reti.lineTo(1235.5, 66);
// edd
reti.moveTo(1235.5-18, 66);
reti.lineTo(1235.5+18, 66);
reti.lineTo(1235.5, 41);
reti.lineTo(1235.5-18, 66);
// edd to D bus
reti.moveTo(1235.5, 41);
reti.lineTo(1235.5, 19);
for (let x = 1365.5; x <= 1445.5; x += 80) 
{
    // SRAM to dsmd
    reti.moveTo(x, 86);
    reti.lineTo(x, 66);
    // dsmd
    reti.moveTo(x-18, 66);
    reti.lineTo(x+18, 66);
    reti.lineTo(x, 41);
    reti.lineTo(x-18, 66);
    // dsmd to D bus
    reti.moveTo(x, 41);
    reti.lineTo(x, 19);
    // SRAM to smdd
    reti.moveTo(x, 86);
    reti.lineTo(x, 66);
}
reti.stroke();
}
drawReti(0);