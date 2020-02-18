var quizletBaseUrl =
	"https://cors-anywhere.herokuapp.com/https://quizlet.com/webapi/3.1/terms?filters[isDeleted]=0&filters[setId]=";

function setup() {
	for (var i = 0; i < 8; i++) {
		newWord("red");
		newWord("blue");
	}
	for (var i = 0; i < 7; i++) {
		newWord("yellow");
	}
	newWord("black");
	newWord().addClass("wildcard");

	$(".word").click(function() {
		$(this).toggleClass("clicked");
		count();
	});

	if (window.location.href.indexOf("?") !== -1) {
		var seed = window.location.href.split("?")[1];
		if (seed == "undercover") {
			$("#undercover_label").show();
		} else {
			$("#seed").val(seed);
		}
	}
}

function newWord(color) {
	var index = $("#board").children().length;
	return $("<div/>")
		.attr("data-index", index)
		.addClass("word")
		.attr("data-color", color)
		.append("<div/>")
		.appendTo("#board");
}

function fire() {
	$("*").removeClass("spymaster clicked");

	//get seed and set the seed for randomizer
	Math.seedrandom($("#seed").val());

	var color = Math.random() > 0.5 ? "red" : "blue";
	$(".wildcard").attr("data-color", color);
	$("#team")
		.css({ color: color })
		.text(color.toUpperCase());

	words = $(".word").sort(function(i, j) {
		return i.getAttribute("data-index") - j.getAttribute("data-index");
	});

	while (words.length > 0) {
		$(words.splice(Math.random() * words.length, 1)[0]).appendTo("#board");
	}

	new Promise(resolve => setTimeout(resolve))
		.then(getWordSetPromise)
		.then(wordSet => wordSet.sort())
		.then(wordSet => {
			//get seed and set the seed for randomizer
			// do again, dont know why
			Math.seedrandom($("#seed").val());
			$(".word > div").each(function(index, element) {
				var location =
					index +
					Math.floor(Math.random() * (wordSet.length - index));
				element.innerHTML = wordSet[location];
				wordSet[location] = wordSet[index];
				wordSet[index] = element.innerHTML;
			});
		});

	count();

	return false;
}

function count() {
	$("#blue_count").text($(":not(.clicked)[data-color=blue]").size());
	$("#red_count").text($(":not(.clicked)[data-color=red]").size());
}

function spyMaster() {
	$("#board").toggleClass("spymaster");
}

function getWordSetPromise() {
	var quizletSetRaw = $("#seed")
		.val()
		.split("&")[0];
	var quizletSetId = parseInt(quizletSetRaw);
	if (isNaN(quizletSetRaw) || isNaN(quizletSetId)) {
		var wordSet = $("#undercover").prop("checked") ? undercover : data;
		return wordSet;
	} else {
		var key;
		if (quizletSetRaw.indexOf("-") == 0) {
			quizletSetId = -quizletSetId;
			key = "definition";
		} else if (quizletSetRaw.indexOf("+") == 0) {
			key = "_imageUrl";
		} else {
			key = "word";
		}
		var url = quizletBaseUrl + quizletSetId;
		return $.getJSON(url)
			.then(json => json.responses[0].models.term)
			.then(terms => terms.map(term => term[key]))
			.then(words => {
				if (key == "_imageUrl") {
					return words.map(word => `<img src=${word}>`);
				} else {
					return words;
				}
			});
	}
}

setup();
fire();
