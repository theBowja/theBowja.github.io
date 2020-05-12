var game = false;
var interval;

var speedMultiplier = 1;
var width = 0; //across
var height = 0; //down
var scoreTrail;

var score = 0;
var apple;
var snakeList = [];
var directionQueue = ["RIGHT"];

var heatmapMax = 0;

var initialSnakeLength =  3;

$(document).ready(function(){  
    $("#formStartButton").submit(function(){
        initialize();

        interval = setInterval( main, 66/speedMultiplier);

        return false;
    });
    $("#checkboxHeatmap").click(function() {
        if(game) return;
    	if($(this).prop("checked")) {
		    for(let i = 1; i <= height; i++) {
		        for(let j = 1; j <= width; j++) {
		        	let tile = $("#d"+i + "a"+j);
                    let hmnum = tile.data().heatmap; 
                    if(typeof hmnum !== "number")
                        hmnum = 0;
		        	let scale = 255-hmnum/heatmapMax*255;
		        	tile.css("background-color", "rgb(255, "+scale+", "+scale+")");
		        }
		    }
    	} else {
            for(let i = 1; i <= height; i++) {
                for(let j = 1; j <= width; j++) {
                    let tile = $("#d"+i + "a"+j);
                    tile.css("background-color", tile.data().gg);
                }
            } 
    	}
    });
});

function initialize() {
    speedMultiplier = $("#selectSpeed").val();
    width = $("#inputWidth").val();
    height = $("#inputHeight").val();
    //scoreTrail = $("#checkboxScore").prop("checked");
    
    // if( width * height > 8192) {
    //     alert("Size too big");
    //     return;
    // }

    $("#selectSpeed").prop("disabled", true);
    $("#inputWidth").prop("readonly", true);
    $("#inputHeight").prop("readonly", true);
    //$("#checkboxScore").prop("disabled", true);
    $("#checkboxHeatmap").prop("checked", false);
    $("#checkboxHeatmap").prop("disabled", true);
    
    $("#buttStart").hide();
    $("#scoreKeep").text("Score: 0");

    $("#gameBorder").empty().css("display", "inline-block");
    
    score = 0;
    snakeList.length = 0;
    directionQueue = ["RIGHT"];
    heatmapMax = 0;
    
    //makes rows
    for( let i = 1; i <= height; i++) {
        $("#gameBorder").append("<div class='row' id='d"+i+"'></div>");

        //makes boxes inside rows
        for( let j = 1; j <= width; j++) {
            $("#d"+i).append("<div class='box' id='d"+i+"a"+j+"'></div>");
        }
    }

    $("#d1").css("padding-top", "1px");

    //Spawns the red snake
    for( let i = 0; i < initialSnakeLength; i++) {
        snakeList.push( {across:i + 1, down:(height / 2)|0});
        $("#d"+snakeList[i].down + "a"+snakeList[i].across).css("background-color", "red");
    }

    spawnApple();
    
    game = true;
}

function getRandCoord() {
    return {across:Math.floor(Math.random() * width) + 1, down:Math.floor(Math.random() * height) + 1};
}

function spawnApple() {
    apple = getRandCoord();
    while( getBoxColor( apple) != "white") {
        apple = getRandCoord();
    }
    
    $("#d"+apple.down + "a"+apple.across).css("background-color", "green");
}


function getBoxColor( coord) {
    var bgcolor = $("#d"+coord.down + "a"+coord.across).css("background-color");
    if( bgcolor == "rgb(255, 255, 255)")
        return "white";
    else if( bgcolor == "rgb(255, 0, 0)")
        return "red";
    else if( bgcolor == "rgb(0, 128, 0)")
        return "green";
    else
        alert("unknown color: " + color);
}

// returns a string "border", "snake", or "apple" determining what the head is colliding against 
function getCollision(head) {
    if( head.down < 1 || head.down > height || head.across < 1 || head.across > width)
        return "border";
    else if( getBoxColor( head) == "red")
        return "snake";
    else if( head.down == apple.down && head.across == apple.across)
        return "apple";
	return "";
}

function setBoxColor(coord, bgcolor) {
    $("#d"+coord.down + "a"+coord.across).css("background-color", bgcolor);
}

function updateScore() {
    score++;
    $("#scoreKeep").text("Score: " + score);
    if( $("#checkboxScore").prop("checked")) {
        $("#d"+apple.down + "a"+apple.across).text( score);
    }
    //$("#d"+(height / 2)|0 + "a"+(width / 2)|0).text(score);
    //$("#d10a10").text(score);
}

function repellant() {
    for( var i = 0; i < snakeList.length; i++) {
        console.log( snakeList[ i]);
    }
    
    console.log(apple);
    console.log("");
}

function move() {
    var aChange = (directionQueue[0] == "RIGHT") - (directionQueue[0] == "LEFT");
    var dChange = (directionQueue[0] == "DOWN") - (directionQueue[0] == "UP");

    return {across:snakeList[snakeList.length - 1].across + aChange, down:snakeList[snakeList.length - 1].down + dChange};
}

function updateHeatmap(coord) {
	var data = $("#d"+coord.down + "a"+coord.across).data();
	if(data.heatmap == undefined)
		data.heatmap = 1;
	else
		data.heatmap++;
	if(data.heatmap > heatmapMax)
		heatmapMax = data.heatmap;
}

function main() {
    //repellant();
    if( directionQueue.length > 1) {
        directionQueue.shift();
    }

    var headcoord = move();
    snakeList.push( headcoord);
    var theFuture = getCollision( headcoord);
    setBoxColor( headcoord, "red");

    if( theFuture == "apple"){
        updateScore();
        spawnApple();
    } else if( theFuture == "snake" || theFuture == "border") {
        gameOver();
    } else {
        setBoxColor( snakeList[0], "white");
        snakeList.shift();
    }
    updateHeatmap( headcoord);

}

function saveBoard() {
    for(let i = 1; i <= height; i++) {
        for(let j = 1; j <= width; j++) {
            let tile = $("#d"+i + "a"+j);
            tile.data().gg = tile.css("background-color");
        }
    } 
}

function gameOver() {
    clearInterval( interval);
    game = false;
    saveBoard();
    $("#selectSpeed").prop("disabled", false);
    $("#inputWidth").prop("readonly", false);
    $("#inputHeight").prop("readonly", false);
    
    //$("#checkboxScore").prop("disabled", false);
    $("#checkboxHeatmap").prop("disabled", false);
    
    $("#buttStart").show().val("Play again").focus();
    //alert("gg");
    // TODO: save state of board
}

document.onkeydown = function(e){
    //37-LEFT | 38-UP | 39-RIGHT | 40-DOWN
    if( game) {
        // e.e || window.event
        
        var lastEle = directionQueue[directionQueue.length - 1];

        if( (e.keyCode == 37 || e.keyCode == 65) && lastEle != "RIGHT" && lastEle != "LEFT") {
            directionQueue.push( "LEFT");
        }

        else if( (e.keyCode == 38 || e.keyCode == 87) && lastEle != "DOWN" && lastEle != "UP") {
            directionQueue.push( "UP");
        }

        else if( (e.keyCode == 39 || e.keyCode == 68) && lastEle != "LEFT" && lastEle != "RIGHT") {
            directionQueue.push( "RIGHT");
        }

        else if( (e.keyCode == 40 || e.keyCode == 83) && lastEle != "UP" && lastEle != "DOWN") {
            directionQueue.push( "DOWN");
        }
    }
};
