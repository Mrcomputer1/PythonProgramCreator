var code = {
	data: {
		inputId: 0,
		blockId: 0,
		fileId: 0,
		programName: ""
	},
	blocks: {
		
	},
	inputs: {
		
	}
};
function saveData(){
	$("input").each(function(){
		$(this).attr("value", $(this).val());
	});
	$("select").each(function(){
		if($(this).parent().attr("data-block") == "openfile"){
			if($(this).val() == "r"){
				$(this).find("[value='r']").attr("selected", "true");
			}else if($(this).val() == "w"){
				$(this).find("[value='w']").attr("selected", "true");
			}
		}
	});
}
var output = "";
$(document).ready(function(){
	$(".block").each(function(){
		$(this).click(function(){
			$clone = $(this).clone();
			var inputs = {};
			$clone.find("input").each(function(){
				$(this).attr("data-input-id", code.data.inputId);
				code['inputs'][code.data.inputId] = code.data.blockId;
				code.data.inputId++;
				inputs[$(this).attr("data-block-input-id")] = "";
				this.readOnly = false;
			});
			$clone.find("select").each(function(){
				$(this).attr("data-input-id", code.data.inputId);
				code['inputs'][code.data.inputId] = code.data.blockId;
				code.data.inputId++;
				inputs[$(this).attr("data-block-input-id")] = "";
				this.disabled = false;
			});
			$clone.attr("data-block-id", code.data.blockId);
			$clone.attr("class", "block-2");
			bid = code.data.blockId;
			code.data.blockId++;
			code['blocks'][bid] = {"type": $clone.attr("data-block"), "inputs": inputs};
			$clone.appendTo("#codearea");
			$("#codearea").append("<br data-block-id='" + bid + "'><br data-block-id='" + bid + "'>");
		});
	});
	setInterval(function(){
		code.data.programName = $("#program-name").val();
		$("#programNameText").html(code.data.programName);
		$(".input-s").each(function(){
			if($(this).val().length == 0){
				$(this).attr("size", 1);
			}else{
				$(this).attr("size", $(this).val().length);
			}
			$(this).unbind("change");
			$(this).unbind("click");
			$(this).change(function(){
				code['blocks'][code['inputs'][$(this).attr("data-input-id")]]['inputs'][$(this).attr("data-block-input-id")] = $(this).val().replace(/'/g, "\\'");
			});
			$(this).click(function(e){
				e.stopPropagation();
			});
		});
		$(".input-d").each(function(){
			if($(this).val().length == 0){
				$(this).attr("size", 1);
			}else{
				$(this).attr("size", $(this).val().length);
			}
			$(this).unbind("change");
			$(this).unbind("click");
			$(this).change(function(){
				code['blocks'][code['inputs'][$(this).attr("data-input-id")]]['inputs'][$(this).attr("data-block-input-id")] = $(this).val().replace(/'/g, "\\'");
			});
			$(this).click(function(e){
				e.stopPropagation();
			});
		});
		$(".block-2").click(function(){
			var id = $(this).attr("data-block-id");
			code['blocks'][id] = {type: "*deleted*", "inputs": {}};
			$("[data-block-id='" + id + "']").each(function(){$(this).remove()});
			$(this).remove();
		});
	}, 100);
	$("#compile").click(function(){
		var runtime = {files: {}};
		output = "# Created with Mrcomputer1's Python Program Creator\n";
		output += "# Program Name: " + code.data.programName + "\n";
		$.each(code.blocks, function(key, value){
			if(value.type == "print"){
				output += "print('" + value['inputs']['1'] + "')\n";
			}else if(value.type == "comment"){
				output += "#" + value['inputs']['1'] + "\n";
			}else if(value.type == "setvar"){
				output += value['inputs']['1'] + " = '" + value['inputs']['2'] + "'\n";
			}else if(value.type == "printvar"){
				output += "print(" + value['inputs']['1'] + ")\n";
			}else if(value.type == "openfile"){
				runtime['files'][value['inputs']['1']] = code.data.fileId;
				output += "file" + code.data.fileId + " = open('" + value['inputs']['1'] + "', '" + value['inputs']['2'] + "')\n";
				code.data.fileId++;
			}else if(value.type == "writetofile"){
				output += "file" + runtime['files'][value['inputs']['2']] + ".write('" + value['inputs']['1'] + "')\n";
			}else if(value.type == "readtovar"){
				output += value['inputs']['2'] + " = file" + runtime['files'][value['inputs']['1']] + ".read()\n";
			}else if(value.type == "closefile"){
				output += "file" + runtime['files'][value['inputs']['1']] + ".close()\n";
			}else if(value.type == "writetofilevar"){
				output += "file" + runtime['files'][value['inputs']['1']] + ".write(" + value['inputs']['2'] + ")\n";
			}else if(value.type == "userinput"){
				output += value['inputs']['2'] + " = input(" + value['inputs']['1'] + ")\n";
			}
		});
		$("#dialog-compileoutput-text").val(output);
		$("#dialog-compileoutput").show();
		$("#download-py-link").attr("href", "data:text/plain;base64," + Base64.encode(output));
		$("#download-py-link").attr("download", code.data.programName + ".py");
	});
	$("#run").click(function(){
		var runtime = {variables: {}, files: {}, fileContent: {}};
		output = "";
		$.each(code.blocks, function(key, value){
			if(value.type == "print"){
				output += value['inputs']['1'].replace(/\\'/g, "'") + "\n";
			}else if(value.type == "setvar"){
				runtime['variables'][value['inputs']['1']] = value['inputs']['2'];
			}else if(value.type == "printvar"){
				if(runtime['variables'][value['inputs']['1']]){
					output += runtime['variables'][value['inputs']['1']] + "\n";
				}else{
					output += "Traceback (most recent call last):\n";
					output += "  File \"<run>\", line (UNKNOWN), in <module>\n";
					output += "NameError: name '" + value['inputs']['1'] + "' is not defined";
					return false;
				}
			}else if(value.type == "openfile"){
				runtime['files'][value['inputs']['1']] = {mode: value['inputs']['2'], name: value['inputs']['1']};
			}else if(value.type == "writetofile"){
				if(runtime['files'][value['inputs']['2']]){
					if(runtime['files'][value['inputs']['2']]['mode'] == "w"){
						if(runtime['fileContent'][value['inputs']['2']]){
							runtime['fileContent'][value['inputs']['2']] = runtime['fileContent'][value['inputs']['2']] + value['inputs']['1'];
						}else{
							runtime['fileContent'][value['inputs']['2']] = value['inputs']['1'];
						}
					}else{
						output += "Traceback (most recent call last):\n";
						output += "  File \"<run>\", line (UNKNOWN), in <module>\n";
						output += "io.UnsupportedOperation: not writable\n";
					}
				}else{
					output += "Traceback (most recent call last):\n";
					output += "  File \"<run>\", line (UNKNOWN), in <module>\n";
					output += "NameError: name '" + value['inputs']['2'] + "' is not defined";
					return false;
				}
			}else if(value.type == "readtovar"){
				if(runtime['files'][value['inputs']['1']]){
					if(runtime['files'][value['inputs']['1']]['mode'] == "r"){
						runtime['variables'][value['inputs']['2']] = runtime['fileContent'][value['inputs']['1']];
					}else{
						output += "Traceback (most recent call last):\n";
						output += "  File \"<run>\", line (UNKNOWN), in <module>\n";
						output += "io.UnsupportedOperation: not readable\n";
					}
				}else{
					output += "Traceback (most recent call last):\n";
					output += "  File \"<run>\", line (UNKNOWN), in <module>\n";
					output += "NameError: name '" + value['inputs']['1'] + "' is not defined";
					return false;
				}
			}else if(value.type == "closefile"){
				if(runtime['files'][value['inputs']['1']]){
					runtime['files'][value['inputs']['1']] = {mode: '*closed*', name: value['inputs']['1']};
				}else{
					output += "Traceback (most recent call last):\n";
					output += "  File \"<run>\", line (UNKNOWN), in <module>\n";
					output += "NameError: name '" + value['inputs']['1'] + "' is not defined";
					return false;
				}
			}else if(value.type == "writetofilevar"){
				if(runtime['files'][value['inputs']['1']]){
					if(runtime['files'][value['inputs']['1']]['mode'] == "w"){
						if(runtime['fileContent'][value['inputs']['1']]){
							if(runtime['variables'][value['inputs']['2']]){
								runtime['fileContent'][value['inputs']['1']] = runtime['fileContent'][value['inputs']['1']] + runtime['variables'][value['inputs']['2']];
							}else{
								output += "Traceback (most recent call last):\n";
								output += "  File \"<run>\", line (UNKNOWN), in <module>\n";
								output += "NameError: name '" + value['inputs']['2'] + "' is not defined";
								return false;
							}
						}else{
							if(runtime['variables'][value['inputs']['2']]){
								runtime['fileContent'][value['inputs']['1']] = runtime['variables'][value['inputs']['2']];
							}else{
								output += "Traceback (most recent call last):\n";
								output += "  File \"<run>\", line (UNKNOWN), in <module>\n";
								output += "NameError: name '" + value['inputs']['2'] + "' is not defined";
								return false;
							}
						}
					}else{
						output += "Traceback (most recent call last):\n";
						output += "  File \"<run>\", line (UNKNOWN), in <module>\n";
						output += "io.UnsupportedOperation: not writable\n";
					}
				}else{
					output += "Traceback (most recent call last):\n";
					output += "  File \"<run>\", line (UNKNOWN), in <module>\n";
					output += "NameError: name '" + value['inputs']['1'] + "' is not defined";
					return false;
				}
			}else if(value.type == "userinput"){
				runtime['variables'][value['inputs']['2']] = prompt(value['inputs']['1']);
			}
		});
		$("#dialog-runoutput-text").val(output);
		$("#dialog-runoutput").show();
		$("#download-output-link").attr("href", "data:text/plain;base64," + Base64.encode(output));
		$("#download-output-link").attr("download", code.data.programName + ".txt");
	});
	$(".area").each(function(){
		$(this).click(function(){
			$(".area-select").each(function(){ $(this).removeClass("area-select"); $(this).addClass("area-unselect"); });
			$(this).addClass("area-select");
			$(".blockpane").each(function(){ $(this).hide(); });
			$("#area-" + $(this).attr("data-area")).show();
		});
	});
	$(".close-dialog").each(function(){
		$(this).click(function(){
			$(this).parent().parent().hide();
		});
	});
	$("#save").click(function(){
		saveData();
		$("#download-save-link").attr("href", "data:text/plain;base64," + Base64.encode(JSON.stringify(code) + "%$%@#$%@$#%" + $("#codearea").html()));
		$("#download-save-link").attr("download", code.data.programName + ".pysave");
		$("#dialog-save").show();
	});
	$("#open-file").click(function(){
		var files = document.getElementById("file").files;
		var reader = new FileReader();
		reader.onload = (function(file){
			return function(e){
				code = JSON.parse(e.target.result.split("%$%@#$%@$#%")[0]);
				$("#codearea").html(e.target.result.split("%$%@#$%@$#%")[1]);
			}
		})(files[0]);
		reader.readAsText(files[0]);
	});
	$("#open").click(function(){
		$("#dialog-open").show();
	});
	$("#about").click(function(){
		$("#dialog-about").show();
	})
});