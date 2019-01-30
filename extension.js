const AQ = require("./aquarium")
const vscode = require('vscode');
const provider = require('./aquarium_tree_provider');
const fs = require("fs-extra");
const NemoFSM = require("./nemo_fsm");

function activate(context) {

	let config = vscode.workspace.getConfiguration('nemo'),
		initialized = false;
		
	function connect() {
		let operations_types = [];
		let libraries = [];
		if ( !initialized ) {
			AQ.login(config.localAquariumServerUser, config.localAquariumServerPassword)
			.then(() => AQ.OperationType.all())
			.then(ots => operations_types = ots)
			.then(() => AQ.Library.all())
			.then(libs => libraries = libs)
			.then(() => {
				for (var i=0; i<operations_types.length; i++) {
					operations_types[i].fsms = {
						protocol: new NemoFSM(context, operations_types[i], 'protocol'),
						precondition: new NemoFSM(context, operations_types[i], 'precondition'),
						documentation: new NemoFSM(context, operations_types[i], 'documentation')
					}
				}
				for (var i=0; i<libraries.length; i++) {
					libraries[i].fsm = new NemoFSM(context, operations_types[i], 'library');
				}				
				vscode.window.showInformationMessage('Found ' + operations_types.length + ' operation types');
				vscode.window.registerTreeDataProvider(
					'aquariumTree',
					new provider.AquariumTreeProvider(operations_types,libraries)
				);
				initialized = true;
			})
			.catch(result => { console.log(result); vscode.window.showInformationMessage(result) } )
		} else {
			vscode.window.showInformationMessage("Already connected");
		}
	}

	function open(record, component) { 

		if ( record ) {		
			if ( record.fsms ) {
				record.fsms[component.toLowerCase()]
				    .dispatch('open')
				    .then(() => console.log("open ok"))
				    .catch(() => console.log("open not ok"));
			} else if ( record.fsm ) {
				vscode.window.showInformationMessage("opening libnrary");
				record.fsm.dispatch('open')
			    	.then(() => console.log("open ok"))
				    .catch(() => console.log("open not ok"))				
			} else {
				vscode.window.showInformationMessage("no fsm found");
			}
		} else {
			vscode.window.showInformationMessage('Nemo is not yet intialized. Try again.');
		}

	}

	context.subscriptions.push(vscode.commands.registerCommand('extension.connect', connect));
	context.subscriptions.push(vscode.commands.registerCommand('extension.openCode',open));	
	
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
