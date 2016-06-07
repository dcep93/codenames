function setup(){
	for(var i=0;i<8;i++){
		newWord("red");
		newWord("blue");
	}
	for(var i=0;i<7;i++){
		newWord("yellow");
	}
	newWord("black");
	newWord().addClass("wildcard");

	$(".word").click(function(){
		$(this).toggleClass("clicked");
	});

}

function newWord(color){
	var index = $("#board").children().length;
	return $("<div/>").attr("data-index",index).addClass("word").attr("data-color",color).append("<div/>").appendTo("#board");
}

function fire(){
	$("*").removeClass("spymaster clicked");

	//get seed and set the seed for randomizer
	Math.seedrandom($("#seed").val());

	data.sort();

	var color = Math.random() > 0.5 ? "red" : "blue";
	$(".wildcard").attr("data-color",color);
	$("#team").css({color:color}).text(color.toUpperCase());

	words = $(".word").sort(function(i,j){return i.getAttribute("data-index")-j.getAttribute("data-index")});

	while(words.length > 0){
		$(words.splice(Math.random()*words.length,1)[0]).appendTo("#board");
	}

	$(".word *").each(function(index,element){
		if($("#seed").val()=="ericisgay"){element.innerHTML = Math.random()<0.33 ? "eric" : (Math.random()<0.5 ? "is" : "gay");return;};
		var location = index+Math.floor(Math.random()*(data.length-index));
		element.innerHTML = data[location];
		data[location] = data[index];
		data[index] = element.innerHTML;
	})


}

function spyMaster(){
	$("#board").toggleClass("spymaster");
}

setup();
fire();
