let tebakan = document.getElementById("guess");

tebakan.addEventListener("keydown", (KeyboardEvent) => {
    if(KeyboardEvent.key == "Enter"){
        checkGuess();
    }
});


function checkGuess(){
    let tebakan = document.getElementById("guess").value;
    let kunciJawaban = document.getElementById("kunci").value;
    let answer = null;

    let div = document.createElement("div");
    div.style.display = "flex";

    //validasi  
    if(tebakan.length != 4){
        return alert("Tebakan harus terdiri dari 4 angka");        
    }

    // logika
    for(i in tebakan){
        if(tebakan[i] == kunciJawaban[i]){
            answer = appendAnswer(tebakan[i], "lightgreen");
            div.appendChild(answer);
        }
        else if(tebakan[i] != kunciJawaban[i] && kunciJawaban.includes(tebakan[i])){
            answer = appendAnswer(tebakan[i], "yellow");
            div.appendChild(answer);
        }
        else{
            answer = appendAnswer(tebakan[i], "tomato");
            div.appendChild(answer);
        }
    }   

    document.getElementById("jawaban").appendChild(div);

}

function appendAnswer(ans, color){
    let paragraph = document.createElement("p");

    switch(color){
        case "lightgreen":
            paragraph.style.backgroundColor = "lightgreen";
            break;
        case "yellow":
            paragraph.style.backgroundColor = "yellow";
            break;
        case "tomato":
            paragraph.style.backgroundColor = "tomato";
            break;
    }

    paragraph.textContent = ans;

    return paragraph
}