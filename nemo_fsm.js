const AQ = require("./aquarium");
const FSM = require("./fsm");
const vscode = require('vscode');
const fs = require("fs-extra");

class NemoFSM extends FSM {

    constructor(context,operation_type, code_type) {
        super();
        this.context = context;
        this.operation_type = operation_type;
        this.code_type = code_type;
    }

    // States ///////////////////////////////////////////////////////////////////////////////////////   

    states() {

        return {

            start: {
                open: () => this.retrieve_code()
                   .then(() => this.code_status()) // returns new state
            },
            
            local_copy_matches: {
                epsilon: () => this.open_code()
                   .then(() => 'start')
            },
    
            local_copy_differs: {
                epsilon: () => this.warn(`Local copy of ${this.code_type} for ${this.operation_type.name} differs from server's.`
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
            .where({parent_class: "OperationType", parent_id: fsm.operation_type.id, name: fsm.code_type})
            .then(codes => {
                fsm.code = codes.length > 0 ? codes.pop().content : `# ${fsm.code_type}`;
                return fsm.code;
            })
    }

    get file_name() {
        let str = this.context.storagePath + "/" + 
               this.operation_type.name + "/" + 
               this.code_type;
        str += this.code_type == 'documentation' ? '.md' : '.rb';
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