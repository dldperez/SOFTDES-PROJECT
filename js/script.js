function sendMessage(){

let input = document.getElementById("userInput");
let chatBox = document.getElementById("chatBox");

let userMessage = document.createElement("div");
userMessage.className = "user-message";
userMessage.innerText = input.value;

chatBox.appendChild(userMessage);

let botMessage = document.createElement("div");
botMessage.className = "bot-message";
botMessage.innerText = "Thanks for your message! Our AI will respond soon.";

chatBox.appendChild(botMessage);

input.value="";
}
