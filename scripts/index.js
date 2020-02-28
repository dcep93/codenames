var quizletBaseUrl =
	"https://cors-anywhere.herokuapp.com/https://quizlet.com/webapi/3.1/";

var termsEndpoint = "terms?filters[isDeleted]=0&filters[setId]=";
var searchEndpoint = "sets/search?filters[isDeleted]=0&perPage=9&query=";

function log(arg) {
	console.log(arg);
	return arg;
}

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

	var params = new URLSearchParams(window.location.search);
	if (params.has("seed")) $("#seed").val(params.get("seed"));
	if (params.has("quizlet")) $("#quizlet").val(params.get("quizlet"));
	if (params.has("key")) $("#key").val(params.get("key"));
	if (params.has("undercover")) $("#undercover_label").show();
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

	// get seed and set the seed for randomizer
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
			// get seed and set the seed for randomizer
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

function writeUrl(args) {
	var args = {
		quizlet: $("#quizlet").val(),
		seed: $("#seed").val(),
		key: $("#key").val()
	};
	args = Object.fromEntries(
		Object.entries(args).filter(([k, v]) => Boolean(v))
	);
	if (history.replaceState) {
		var newurl =
			window.location.protocol +
			"//" +
			window.location.host +
			window.location.pathname +
			"?" +
			$.param(args);
		history.replaceState(null, null, newurl);
	}
	return args;
}

function getWordSetPromise() {
	var args = writeUrl();
	var keyword = args.quizlet;
	if (keyword) {
		var quizletSetId = parseInt(keyword);
		if (isNaN(quizletSetId)) {
			return getQuizletFromSearch(keyword, args.key);
		} else {
			return getQuizletFromId(quizletSetId, args.key);
		}
	} else {
		var wordSet = $("#undercover").prop("checked") ? undercover : data;
		return wordSet;
	}
}

function getQuizletFromSearch(keyword, key) {
	var url = quizletBaseUrl + searchEndpoint + keyword;
	return $.getJSON(url)
		.then(json => json.responses[0].models.set[0].id)
		.then(setId => getQuizletFromId(setId, key));
}

function getQuizletFromId(quizletSetId, key) {
	$("#quizlet").val(quizletSetId);
	writeUrl();
	var url = quizletBaseUrl + termsEndpoint + quizletSetId;
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

setup();
fire();
