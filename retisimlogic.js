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

let reti = document.querySelector("#canvas");
reti.width = window.innerWidth;
reti.height = window.innerHeight;
reti = reti.getContext("2d");

function drawDriver(x, y) {
    reti.beginPath();
    reti.strokeStyle = "black";
    reti.moveTo(x-18, y);
    reti.lineTo(x+18, y);
    reti.lineTo(x,y+25);
    reti.lineTo(x-18, y);
    reti.stroke();
}

function drawDriverUp(x, y) {
    reti.beginPath();
    reti.moveTo(x-18, y);
    reti.lineTo(x+18, y);
    reti.lineTo(x, y - 25);
    reti.lineTo(x-18, y);
    reti.stroke();
}

function drawLine(x1, x2, y1, y2, color = "black", width = 2)
{
    reti.beginPath();
    reti.lineWidth = width;
    reti.strokeStyle = color;
    reti.moveTo(x1, y1);
    reti.lineTo(x2, y2);
    reti.stroke();
}

function drawReti(color) {
reti.clearRect(0, 0, window.innerWidth, window.innerHeight);
reti.lineWidth = 3;
// DI Bus
drawLine(0, 686, 18, 18, color["DI"], 3);
// D Bus
drawLine(711, 1500, 18, 18, color["D"], 3);
// L Bus
drawLine(30, 745, 301, 301, color["alu"], 3);
// R Bus
drawLine(771, 980, 301, 301, color["alu"], 3);
// A Bus
drawLine(0, 1500, 437, 437, color["A"], 3);
let offset_y = 0;
let offset_x = 0;
// L to alu and R to alu
drawLine(720.5, 720.5, 302, 320, color["alu"]);
drawLine(795.5, 795.5, 320, 302, color["alu"]);
// alu
reti.beginPath();
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
reti.stroke();
// alu to aluad
drawLine(759.5, 759.5, 381, 400, color["aluA"]);
//aluad
drawDriver(759.5, 401);
// aluad to A bus
drawLine(759.5, 759.5, 426, 436, color["aluA"]);
// line for 0^32
drawLine(42.5, 42.5, 245, 265, color["0L"]);
// 0ld
drawDriver(42.5, 266);
// 0ld to L bus
drawLine(42.5, 42.5, 291, 300, color["0L"]);
// ddld
reti.beginPath();
reti.moveTo(710.5, 1);
reti.lineTo(710.5, 36);
reti.lineTo(685.5, 18);
reti.lineTo(710.5, 1);
reti.stroke();
//aludid to DI bus
drawLine(19.5, 19.5, 19, 300, color["aluDI"]);
//aluid to ALU
reti.beginPath();
reti.strokeStyle = color["aluDI"];
reti.moveTo(19.5, 326);
reti.lineTo(19.5, 391);
reti.lineTo(759, 391);
reti.stroke();
//aludid
drawDriverUp(19.5, 325);
//pc to pcad
reti.beginPath();
reti.strokeStyle = color["pcA"];
reti.moveTo(100.5, 100);
reti.lineTo(75.5, 100);
reti.lineTo(75.5, 340);
reti.stroke();
//pcad
drawDriver(75.5, 340);
//pcad to A bus
drawLine(75.5, 75.5, 365, 436, color["pcA"]);
// DI bus to IVN
drawLine(55.5, 55.5, 19, 68, color["IVNin"]);
// IVN
reti.strokeRect(55.5 - 25, 68, 50, 25);
// IVN to ivld
drawLine(55.5, 55.5, 93, 165, color["IVNout"]);
// ivld
drawDriver(55.5, 166);
// ivld to L bus
reti.beginPath();
reti.strokeStyle = color["IVNL"];
reti.moveTo(55.5, 191);
reti.lineTo(55.5, 240);
reti.lineTo(65.5, 240);
reti.lineTo(65.5, 300);
reti.stroke();
let reg = {100.5: "PC", 180.5: "IN1", 260.5: "IN2", 340.5: "ACC", 420.5: "SP",
    500.5: "BAF", 580.5: "CS", 660.5: "DS"};

for (let x = 100.5; x <= 740; x += 80) {
  // DI bus to registers
  drawLine(x, x, 19, 35, color[reg[x]+"in"]);
  // registers 
  reti.strokeRect(x-25, 36, 50, 25);
  // register to [reg]ld
  drawLine(x, x, 62, 265, color[reg[x]+"L"]);
  // [reg]ld
  drawDriver(x, 266);
  // register to [reg]dd
  drawLine(x, x+24, 241 - offset_y, 241 - offset_y, color[reg[x]+"D"]);
  // [reg]dd to D bus
  drawLine(x+51, x+750-offset_x, 241 - offset_y, 241 - offset_y, color[reg[x]+"D"]);
  drawLine(x+750-offset_x, x+750-offset_x, 241 - offset_y, 19, color[reg[x]+"D"]);
  // [reg]ld to L bus
  drawLine(x+0.1, x+0.1, 291, 300, color[reg[x]+"L"]);
  // [reg]dd
  reti.beginPath();
  reti.moveTo(x+25, 241 - offset_y - 18);
  reti.lineTo(x+25, 241 - offset_y + 18);
  reti.lineTo(x+50, 241 - offset_y);
  reti.lineTo(x+25, 241 - offset_y - 18);
  reti.stroke();
  offset_y += 23;
  offset_x += 97;
}
// R bus drivers, transition and registers
let trans = {780.5: "0R", 840.5: "IR", 900.5: "DR"};
for (let x = 780.5; x <= 1020; x += 60) 
{
// 0rd ird drd to R bus
drawDriver(x, 266);
drawLine(x+0.1, x+0.1, 291, 300, color[trans[x]]);
}
//ic up line
drawLine(780.5, 780.5, 265, 250);
// 0rd up line
drawLine(840.5, 840.5, 265, 250, color["0R"]);
// I to ird
drawLine(900.5, 900.5, 265, 62, color["IR"]);
// I reg
reti.strokeRect(900.5-25, 36, 50, 25);
// D bus to I
drawLine(900.5, 900.5, 19, 35, color["DtoI"]);
// D to drd
drawLine(960.5, 960.5, 265, 19, color["DR"]);
// I to Iad
reti.beginPath();
reti.strokeStyle = color["IA"];
reti.moveTo(900.5, 100);
reti.lineTo(925.5, 100);
reti.lineTo(925.5, 340);
reti.stroke();
// Iad
drawDriver(925.5, 340);
// Iad to A bus
drawLine(925.5, 925.5, 365, 436, color["IA"]);
// UART, EPROM, SRAM
for (let x = 1065.5; x <= 1585.5; x += 170) 
{
    // A to driver
    drawLine(x, x, 436, 406);
    //driver
    drawDriverUp(x, 406);
    // UART, EPROM, SRAM
    reti.strokeRect(x -77, 86, 155, 270);
    // driver to UART, EPROM, SRAM
    drawLine(x, x, 381, 357);
}
// UART to dud
reti.beginPath();
reti.moveTo(1065.5, 86);
reti.lineTo(1065.5, 76);
reti.lineTo(1035.5, 76);
reti.lineTo(1035.5, 66);
reti.stroke();
// dud
drawDriver(1035.5, 41);
// dud to D bus
drawLine(1035.5, 1035.5, 41, 19);
// UART to udd
drawLine(1065.5, 1075.5, 76, 66);
// udd
drawDriverUp(1075.5, 66);
// udd to D bus
drawLine(1075.5, 1075.5, 41, 19);
// udd 0^32
drawLine(1075.5, 1085.5, 66, 76);
// EPROM to edd
drawLine(1235.5, 1235.5, 86, 66);
// edd
drawDriverUp(1235.5, 66);
// edd to D bus
drawLine(1235.5, 1235.5, 41, 19);
for (let x = 1365.5; x <= 1445.5; x += 80) 
{
    // dsmd
    if(x != 1365.5)
    {
    drawDriverUp(x, 66);
    }
    else
    {
    drawDriver(x, 41);
    }
    // dsmd to D bus
    drawLine(x, x, 41, 19);
    // SRAM to smdd
    drawLine(x, x, 86, 66);
}
}
drawReti(0);

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
async function executeOperation(operation, normalbetrieb, registers, color) {
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
function writeLog(log, registers) {
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
}

function defineColors(registers) {
    let reti_colors = {"0L": "black", "alu": "black", "aludDI": "black", "aluA": "black",
        "pcA": "black", "A": "black", "D": "black", "DI": "black",
        "0R": "black", "IR": "black", "IA": "black", "DR": "black", "DtoI": "black"};
    for (let key in registers) {
        reti_colors[key + "in"] = "black";
        reti_colors[key + "out"] = "black";
        reti_colors[key + "L"] = "black";
        reti_colors[key + "D"] = "black";
    }
    return reti_colors;
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
        writeLog(log, registers);
        let reti_colors = defineColors(registers);
        reti_colors["pcA"] = "red";
        reti_colors["A"] = "red";
        reti_colors["D"] = "red";
        reti_colors["DtoI"] = "red";

        drawReti(reti_colors);
        // await so setTimeout doesnt freeze the browser
        // when promise is resolved, the function continues
        await delay(1000);
        // execute phase
        reti_colors = defineColors(registers);
        let result = await executeOperation(sram.children[[registers["PC"]]].innerHTML, NB, registers, reti_colors);
        NB = result[1];
        if (!result[0]) {
            console.log("Invalid operation");
            break;
        }
        log.innerHTML = "INSTRUCTION " + registers["PC"].toString().padStart(3, ' ') + ": " + 
        (sram.children[[registers["PC"]]].innerHTML + " EXECUTE PHASE").padStart(20, ' ');
        writeLog(log, registers);
        drawReti(reti_colors);
        await delay(1000);
        registers["PC"]++;
        }
}