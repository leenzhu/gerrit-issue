var Http = {
	get:function(url, fn) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
				fn.call(this, xhr.responseText);
			}
		}
		xhr.send(null);
	}
}

function ToJson(data) {
		//console.log("ajax get data", data);
		var json = data.substr(5);
		var json = JSON.parse(json);
		//console.log("json: ", json);
		return json;
}

function GetChangeInfo(data) {
		var changes = ToJson(data);
		if (changes == null) {
			console.log("data is not valid json:", data);
			return;
		}

		var reg = /(^VBRAS-\d+) .*/;
		var issue_id = changes[0].subject.match(reg)[1];
		var msgs = [
				"Change-Id: " + changes[0].change_id,
				"Subject: " + changes[0].subject,
				""
		];
		changes.forEach(function(change) {
			var msg = [
				"Branch: " + change.branch,
				"CommitId: " +  change.current_revision,
				"URL: http://172.16.164.211/#/c/" + change._number,
				""
			];
			msgs.push(msg.join('\n'));
		});
		var log = msgs.join('\n');
		//console.log(log);
		info = document.createElement('div');
		info.innerHTML = "<br/></button><button style=\"width:245px\" class=\"btn\" data-clipboard-target=\"#info\">Copy</button><a style=\"padding:3px;border:1px solid;background-color:lightgray\" href=\"http://172.16.66.198:8080/browse/"+issue_id+"\">Goto JIRA "+issue_id+"</a><br/><textarea id='info' rows=9 cols=50 readonly>{quote}\n"+log+"\n{quote}</textarea>";
		msgdiv = document.querySelector('.com-google-gerrit-client-change-CommitBox_BinderImpl_GenCss_style-text');
		msgdiv.appendChild(info);
}

function GetIssueId(data) {
	var reg = /(^VBRAS-\d+) .*/;
	var json = ToJson(data);
	var subject = json.subject;
	var issue_id = subject.match(reg);
	if (issue_id === null) {
		console.log("No issue id found in ", subject);
		return;
	}
	//console.log(issue_id);
	issue_id = issue_id[1];
	var url = 'http://172.16.164.211/changes/?q=' + issue_id + '+status:merged&n=25&O=4404';
	Http.get(url, GetChangeInfo);
}

function make_issue_info() {
	var hash = window.location.href;
	var reg = /#\/c\/(\d+)/;
	var num = hash.match(reg);
	if (num == null) {
		console.log('Not Issue Page');
		return;
	}
	
	num = num[1];
	var url = 'http://172.16.164.211/changes/'+num+'/detail?O=4404'
	//console.log("hash info:", hash, "num:", num, "url:", url);
	Http.get(url, GetIssueId);
}

var clipboard = new Clipboard('.btn');
clipboard.on('success', function(e) {
	console.log(e);
});
clipboard.on('error', function(e) {
	console.log(e);
});

window.onhashchange = make_issue_info;
document.addEventListener("DOMNodeInserted",function(e){
	if (e.relatedNode.className == "com-google-gerrit-client-change-CommitBox_BinderImpl_GenCss_style-text") {
		//console.log(e);
		make_issue_info();
		document.removeEventListener("DOMNodeInserted", arguments.callee, false);
	}
},false);