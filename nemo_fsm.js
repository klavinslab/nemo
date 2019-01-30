const AQ = require("./aquarium");
const FSM = require("./fsm");
const vscode = require('vscode');
const fs = require("fs-extra");

class NemoFSM extends FSM {

    constructor(context, record, code_type) {
        super();
        this.context = context;
        this.record = record;
        this.code_type = code_type;
        if ( code_type == "library" ) {
            this.type = "Library";
        } else {
            this.type = "OperationType";
        }
    }

    // States ///////////////////////////////////////////////////////////////////////////////////////   

    states() {

        return {

            start: {
                open: () => this.retrieve_code().then(() => this.code_status()),
                push: () => this.push_code().then(() => 'start')
            },
            
            local_copy_matches: {
                epsilon: () => this.open_code().then(() => 'start')
            },
    
            local_copy_differs: {
                epsilon: () => this.warn(`Local copy of ${this.code_type} for ${this.record.name} differs from server's. `
                                        + "Push it or remove it to proceed.")
                   .then(() => this.open_code())
                   .then(() => 'start')
            },

            no_local_copy: {
                epsilon: () => this.write_file()
                   .then(() => this.open_code())
                   .then(() => 'start')
            } 

        };

    }

    // Helpers //////////////////////////////////////////////////////////////////////

    retrieve_code() {
        let fsm = this;
        return AQ.Code
            .where({
                parent_class: fsm.type, 
                parent_id: fsm.record.id, 
                name: fsm.code_type == "library" ? "source" : fsm.code_type 
            })
            .then(codes => {
                if ( codes.length > 0 ) {
                    console.log("more than 0 codes");
                    let temp = codes.pop();
                    fsm.code = temp.content;
                    console.log(fsm.code);
                    fsm.code_id = temp.id;
                } else {
                    fsm.code = `# ${fsm.code_type}`;
                    fsm.code_id = -1;
                }
                return fsm.code;
            })
    }

    push_code() {

        var controller;
        if ( fsm.redord.model.model === "OperationType" ) {
            controller = "operation_types";
        } else {
            controller = "libraries";
        }
        console.log({
            id: fsm.code_id,
            name: component_name == "library" ? "source" : component_name,
            content: fsm.code
        });
        return AQ.post( "/" + controller + "/code", {
            id: fsm.code_id,
            name: component_name == "library" ? "source" : component_name,
            content: fsm.code
        })

    }    

    get file_name() {
        let str = this.context.storagePath + "/" + 
               this.type + "/" + 
               this.record.name + "/" + 
               this.record.category + "/" + 
               this.code_type;
        str += this.code_type == 'documentation' ? '.md' : '.rb';
        // console.log(str);
        return str
    }

    code_status() {
        let fsm = this;
        if ( !fs.existsSync(fsm.file_name) ) {
            return Promise.resolve("no_local_copy");
        } else {
            if ( fs.readFileSync(fsm.file_name) == fsm.code ) {
                return 'local_copy_matches';
            } else {
                return 'local_copy_differs';                
            }
        }
    }

	write_file() {
        let fsm = this;
		return new Promise(function(resolve, reject) {
			fs.outputFile( fsm.file_name, fsm.code, function (err) {
				if (err) { reject(err) };
				resolve();
			});
		});
	}    

    open_code() {
        let fsm = this;
        return vscode.workspace.openTextDocument(vscode.Uri.file(fsm.file_name))
            .then(doc => vscode.window.showTextDocument(doc))
    }

    say(msg) {
        return new Promise(function(resolve, reject) {
          vscode.window.showInformationMessage(msg);
          resolve();
        })
    }

    warn(msg) {
        return new Promise(function(resolve, reject) {
          vscode.window.showWarningMessage(msg);
          resolve();
        })
    }

}

module.exports = NemoFSM;