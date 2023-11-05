var stopped = true

function convBin(num,bin){
  while(num !== 0 ){
    bin += [num % 2]
    num /= 2
    num = Math.floor(num)
  }
  while(bin.length < 22){
    bin.unshift()
  }
  return bin
}

function binOp(op,num1,num2){
  bin1 = convBin(num1,[])
  bin2 = convBin(num2,[])
  new_num = 0
  boolean = {1 : true, 0 : false}
  binary = {true : 1, false : 0}
  if (bin1 > 22 || bin2 > 22){ //overflow
    signal = -1
    return 0
  }
  else{
    for(i=0; i < 22;i++){
      if(op == "xor"){
        new_num += binary[!(!(!(boolean[bin1[i]] && boolean[bin2[i]]) && boolean[bin1[i]]) && !(!(boolean[bin1[i]] && boolean[bin2[i]]) && boolean[bin2[i]]))] * 2**i
      }
      else if(op == "and"){
        new_num += binary[boolean[bin1[i]] && boolean[bin2[i]]] * 2**i
      }
      else{
        new_num += binary[boolean[bin1[i]] || boolean[bin2[i]]] * 2**i
      }
    }
    return new_num
  }
}

function runReti(){
  document.getElementById("error").style.top = document.getElementById("code").style.lineHeight
  if(lines.length <= registers["PC"]){
    stopped = true
    updateReg(0)
  }
  if(registers["PC"] < 0){
    return stopped = true,document.getElementById("error").innerHTML = "PC negative"
  }
  if(!stopped){
    document.getElementById("arrow").style.top = 18 + 10 * registers["PC"] + "px"
    logic = lines[registers["PC"]].split(" ") // extract the reti code
    logic = logic.filter(item => item !== "") // remove spaces
    console.log(logic)
    // interpret reti logic
    if(logic[0] == "RTI" && logic.length == 1){
      console.log("RTI is working")     
    }
    else if(logic[0] == "NOP" && logic.length == 1){
      registers["PC"] += 1
      return updateReg(-1),setTimeout(runReti,500)
    }
    else if(logic.length == 2 && /^-?\d+$/.test(logic[1])){ // all numbers allowed
      logic[1] =  parseInt(logic[1])
      switch(logic[0]){
        case "INT":
          if( /^\d+$/.test(logic[1])){
          console.log("INT is working")
          }
          else{
            return stopped = true,updateReg(),document.getElementById("error").innerHTML = "i must be positive in line " + registers["PC"]
          }
          return updateReg(-logic[1]-1),setTimeout(runReti,1000)
        case "JUMP>": //adds up constant logic[1] to PC, if it fullfills the ACC cond else increment pc by 1
          registers["PC"] += (registers["ACC"] > logic[1]) ? logic[1] : 1
          return (registers["ACC"] > logic[1]) ? (updateReg(-logic[1]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000)) 
        case "JUMP=":
          registers["PC"] += (registers["ACC"] = logic[1]) ? logic[1] : 1
          return (registers["ACC"] == logic[1]) ? (updateReg(-logic[1]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000)) 
        case "JUMP>=":
          registers["PC"] += (registers["ACC"] >= logic[1]) ? logic[1] : 1
          return (registers["ACC"] >= logic[1]) ? (updateReg(-logic[1]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000)) 
        case "JUMP<":
          registers["PC"] += (registers["ACC"] < logic[1]) ? logic[1] : 1
          return (registers["ACC"] < logic[1]) ? (updateReg(-logic[1]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000)) 
        case "JUMP!=":
          registers["PC"] += (registers["ACC"] !== logic[1]) ? logic[1] : 1
          return (registers["ACC"] !== logic[1]) ? (updateReg(-logic[1]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000)) 
        case "JUMP<=":
          registers["PC"] += (registers["ACC"] <= logic[1]) ? logic[1] : 1
          return (registers["ACC"] <= logic[1]) ? (updateReg(-logic[1]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000)) 
        case "JUMP":
          registers["PC"] += logic[1]
          return updateReg(-logic[1]-1),setTimeout(runReti,1000)
        default:
          return stopped = true,updateReg(),document.getElementById("error").innerHTML = "invalid ReTI command in line " + registers["PC"]
    }
  }
  else if(logic.length == 3 && logic[1] in registers){
    if(/^-?\d+$/.test(logic[2]))
    {
      logic[2] = parseInt(logic[2]);
    }
    if(/^-?\d+$/.test(logic[2]) ){
      if(!(logic[1] == "PC" && (logic[0] == "LOAD" ||logic[0] == "LOADI" ))){ // only if logic[0] in register FIXX !!!!
        registers["PC"] += 1
      }
      switch(logic[0]){
        case "LOAD":
          if(/^\d+$/.test(logic[2])){
          updateMem(logic[2]) // update memory if necessary
          registers[logic[1]] = memory[logic[2]] // D:= M(< i >) ,LOAD D i 
          return logic[1] == "PC" ?  (updateReg(-logic[2]),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000)) // since PC not incremented when PC dont need to subract 1
          }
          return stopped = true,updateReg(),document.getElementById("error").innerHTML = "negative index in line " + registers["PC"] // negative index
        case "LOADI":
          registers[logic[1]] = logic[2] // D:= 0**10 ,LOADI D i
          return logic[1] == "PC" ?  (updateReg(-logic[2]),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
        case "STORE":
          if(/^\d+$/.test(logic[2])){
          updateMem(logic[2]) // update memory if necessary
          lengthOfOldNumber = ("" + memory[logic[2]]).length
          document.getElementById("" + logic[2]).innerHTML = document.getElementById("" + logic[2]).textContent.slice(0,document.getElementById("" + logic[2]).textContent.length - lengthOfOldNumber) + registers[logic[1]] // M(< i >) := S ,STORE S i , replace last num
          memory[logic[2]] = registers[logic[1]] // replace old with new number at slot logic[2] of memory
          return updateReg(-1),setTimeout(runReti,1000)
          }
          return stopped = true,updateReg(),document.getElementById("error").innerHTML = "negative index in line " + registers["PC"] // negative index
        case "ADDI":
          registers[logic[1]] += logic[2] // [D] := [D] + [i]
          return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
        case "SUBI":
          registers[logic[1]] -= logic[2] // [D] := [D] - [i]
          console.log(registers["PC"])
          return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
        case "MULI":
          registers[logic[1]] *= logic[2] // [D] := [D] * [i]
          return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
        case "DIVI":
          registers[logic[1]] /= logic[2] // [D] := [D] / [i]
          registers[logic[1]] = Math.floor(registers[logic[1]])
          return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
        case "MODI":
          registers[logic[1]] %= logic[2] // [D] := [D] % [i]
          return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
        case "OPLUSI":
          registers[logic[1]] = binOp("xor",registers[logic[1]],logic[2])
          return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
        case "ORI":
          registers[logic[1]]= binOp("or",registers[logic[1]],logic[2])
          return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
        case "ANDI":
          registers[logic[1]] = binOp("and",registers[logic[1]],logic[2])
          return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
        default:
          break // check lower if
    }
  }
  if(/^\d+$/.test(logic[2]) || logic[2] in registers){ // only positive numbers allowed
    if(!(logic[2] == "PC" && logic[0] == "MOVE") && logic[2] in registers){
      registers["PC"] += 1
    }
    switch(logic[0]){
      case "MOVE":
        if (logic[2] in registers){
        registers[logic[2]] = registers[logic[1]] // D := S ,MOVE S D
        }
        else{
          return stopped = true,updateReg(),document.getElementById("error").innerHTML = "invalid register in line " + registers["PC"]
        }
        return logic[2] == "PC" ?  (updateReg(-logic[2]),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
      case "ADD":  
        registers[logic[1]] += (logic[2] in registers) ? registers[logic[2]] : memory[logic[2]]  // [D] := [D] + [M(< i >)], [D] := [D] + [S]   
        return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
      case "SUB":
        registers[logic[1]] -=  (logic[2] in registers) ? registers[logic[2]] : memory[logic[2]] // [D] := [D] - [M(< i >)], [D] := [D] - [S]
        return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
      case "MUL":
        registers[logic[1]] *=  (logic[2] in registers) ? registers[logic[2]] : memory[logic[2]]// [D] := [D] * [M(< i >)], [D] := [D] * [S]
        return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
      case "DIV":
        registers[logic[1]] /=  (logic[2] in registers) ? registers[logic[2]] : memory[logic[2]]// [D] := [D] / [M(< i >)], [D] := [D] / [S]
        registers[logic[1]] = Math.floor(registers[logic[1]])
        return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
      case "MOD":
        registers[logic[1]] *=  (logic[2] in registers) ? registers[logic[2]] : memory[logic[2]]// [D] := [D] % [M(< i >)], [D] := [D] % [S]
        return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
      case "OPLUS":
        registers[logic[1]] = (logic[2] in registers) ? binOp("xor",registers[logic[1]],registers[logic[2]]) : binOp("xor",registers[logic[1]],memory[logic[2]])//D := D ⊕ M(< i >), D := D ⊕ S
        return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
      case "OR":
        registers[logic[1]] = (logic[2] in registers) ? binOp("or",registers[logic[1]],registers[logic[2]]) : binOp("or",registers[logic[1]],memory[logic[2]]) //D := D ∨ M(< i >), D := D ∨ S
        return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
      case "AND":
        registers[logic[1]] = (logic[2] in registers) ? binOp("and",registers[logic[1]],registers[logic[2]]) : binOp("and",registers[logic[1]],memory[logic[2]]) //D := D ∧ M(< i >), D := D ∧ S
        return logic[1] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
      default:
        return stopped = true,updateReg(),document.getElementById("error").innerHTML = "invalid ReTI command in line " + registers["PC"]
  }
  }
  }
  else if(logic.length == 4 && logic[1] in registers && logic[2] in registers && /^-?\d+$/.test(logic[3])){
    logic[3] =  parseInt(logic[3])
    if(logic[1] + logic[3] < 0){
      return stopped = true,updateReg(),document.getElementById("error").innerHTML = "negative index in line " + registers["PC"]
    }
    if(logic[0] = "LOADIN"){
      updateMem(logic[2]) // update memory if necessary
      registers[logic[2]] = memory[registers[logic[1]] + logic[3]]//D := M(< S > + i)
      registers["PC"] += 1
      logic[2] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
    }
    else if(logic[0] = "STOREIN"){
      updateMem(logic[1] + logic[3]) // update memory if necessary
      lengthOfOldNumber = ("" + memory[registers[logic[1]] + logic[3]]).length
      document.getElementById("" + (registers[logic[1]] + logic[3])).innerHTML = document.getElementById("" + (registers[logic[1]] + logic[3])).textContent.slice(0,document.getElementById("" + (registers[logic[1]] + logic[3])).textContent.length - lengthOfOldNumber) + registers[logic[2]]
      memory[registers[logic[1]] + logic[3]] = registers[logic[2]]//M(< D > + i) := S
      registers["PC"] += 1
      return logic[2] == "PC" ?  (updateReg(-logic[2]-1),setTimeout(runReti,1000)) : (updateReg(-1),setTimeout(runReti,1000))
    }
    else{
      return stopped = true,updateReg(),document.getElementById("error").innerHTML = "invalid ReTI command and register in line " + registers["PC"]
    }
  }
  else{
    return stopped = true,updateReg(),document.getElementById("error").innerHTML = (logic.length == 0) ? "" : "invalid ReTI command and register in line " + registers["PC"]
  }
}
}

var memory = [0,0,0,0,0,0,0,0,0,0]
var registers = {"ACC" : 0,"PC" : 0,"IN1" : 0,"IN2" : 0,"SP" : 0,"BAF" : 0,"CS" : 0,"DS" : 0}

document.getElementById("run").onclick = function(){
  //sram
  while(document.getElementById("memory").childElementCount !== memory.length){
    document.getElementById("memory").removeChild(document.getElementById("memory").lastElementChild)
  }
  for (let i = 0; i < document.getElementById("memory").childElementCount; i++) { //reset memory slots to 0
    lengthOfOldNumber = ("" + memory[i]).length
    document.getElementById("" + i).innerHTML = document.getElementById("" + i).textContent.slice(0,document.getElementById("" + i).textContent.length - lengthOfOldNumber) + 0
  }
  memory = [0,0,0,0,0,0,0,0,0,0]
//registers
  registers = {"ACC" : 0,"PC" : 0,"IN1" : 0,"IN2" : 0,"SP" : 0,"BAF" : 0,"CS" : 0,"DS" : 0}
  document.getElementById("arrow").innerHTML = "<-"
  document.getElementById("error").innerHTML = "" // reset error msg
  lines = document.getElementById("code").value.split('\n') //get all lines and put into array
  if(stopped){ // when run clicked again dont let it call runReti because weird stuff happens
  stopped = false
  runReti()
  }
}

function updateReg(a = 0){
document.getElementById("pc").innerHTML = registers["PC"] + a
document.getElementById("in1").innerHTML = registers["IN1"]
document.getElementById("in2").innerHTML = registers["IN2"]
document.getElementById("acc").innerHTML = registers["ACC"]
document.getElementById("sp").innerHTML = registers["SP"]
document.getElementById("baf").innerHTML = registers["BAF"]
document.getElementById("cs").innerHTML = registers["CS"]
document.getElementById("ds").innerHTML = registers["DS"]
}

function updateMem(index){
  while(index > memory.length-1){ // dynamically increase size of mem
    memory.push(0)
    var div = document.createElement("div")
    div.id = memory.length-1
    div.innerHTML = "            0"
    document.getElementById("memory").appendChild(div) // add new div
  }

}
    
updateReg()

document.querySelector('textarea').addEventListener('keyup', event => { // each time key is pressed count num of newlines add so many <span> to be able to count them and make linenumbers
  const numberOfLines = event.target.value.split('\n').length
  document.querySelector('.line-numbers').innerHTML = Array(numberOfLines)
    .fill('<span></span>')
    .join('')
})