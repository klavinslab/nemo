const AQ = require("./aquarium");
const FSM = require("./fsm");
const vscode = require("vscode");
const fs = require("fs-extra");
const ejs = require("ejs");

class NemoFSM extends FSM {
  constructor(context, record, code_type) {
    super();
    this.context = context;
    this.record = record;
    this.code_type = code_type;
    if (code_type == "library") {
      this.type = "Library";
    } else {
      this.type = "OperationType";
    }
  }

  // States ///////////////////////////////////////////////////////////////////////////////////////

  states() {
    let fsm = this;

    return {
      start: {
        open: () => fsm.retrieve_code().then(() => fsm.code_status()),
        push: () =>
          fsm
            .push_code()
            .then(new_code => {
              fsm.code = new_code.data.content;
              fsm.code_id = new_code.data.id;
            })
            .then(() =>
              fsm.say(
                `Pushed ${fsm.code_type} to server. New version is ${
                  fsm.code_id
                }.`
              )
            )
            .then(() => "start"),
        status: () =>
          fsm
            .code_status()
            .then(status =>
              fsm.say(`Status: ${status}. Version ${fsm.code_id}.`)
            )
            .then(() => "start"),
        test: () =>
          fsm
            .push_code()
            .then(() => fsm.test())
            .then(() => "start")
      },

      local_copy_matches: {
        epsilon: () => fsm.open_code().then(() => "start")
      },

      local_copy_differs: {
        epsilon: () =>
          fsm
            .warn(
              `Local copy of ${fsm.code_type} for ${
                fsm.record.name
              } differs from server's. ` + "Push it or remove it to proceed."
            )
            .then(() => fsm.open_code())
            .then(() => "start")
      },

      no_local_copy: {
        epsilon: () =>
          fsm
            .write_file()
            .then(() => fsm.open_code())
            .then(() => "start")
      }
    };
  }

  // Helpers //////////////////////////////////////////////////////////////////////

  retrieve_code() {
    let fsm = this;
    return AQ.Code.where({
      parent_class: fsm.type,
      parent_id: fsm.record.id,
      name: fsm.code_type == "library" ? "source" : fsm.code_type
    }).then(codes => {
      if (codes.length > 0) {
        var j = 0;
        for (var i = 0; i < codes.length; i++) {
          if (codes[i].id > codes[j].id) {
            j = i;
          }
        }
        let temp = codes[j];
        fsm.code = temp.content;
        fsm.code_id = temp.id;
      } else {
        fsm.code = `# ${fsm.code_type}`;
        fsm.code_id = -1;
      }
      return fsm.code;
    });
  }

  push_code() {
    let fsm = this;
    var controller;

    if (fsm.record.model.model === "OperationType") {
      controller = "operation_types";
    } else {
      controller = "libraries";
    }

    console.log({
      model: fsm.record.model.model,
      controller: controller,
      id: fsm.record.id,
      name: fsm.code_type == "library" ? "source" : fsm.code_type,
      content: fsm.code
    });

    return AQ.post("/" + controller + "/code", {
      id: fsm.record.id,
      name: fsm.code_type == "library" ? "source" : fsm.code_type,
      content: fs.readFileSync(fsm.file_name)
    });
  }

  get test_results_file_name() {
    return this.file_path + "/test_results.md";
  }

  write_test_results_file(results) {
    let fsm = this;
    let filename = fsm.context.asAbsolutePath("views/test_results_template.md");
    return new Promise(function(resolve, reject) {
      ejs.renderFile(
        filename,
        { results: results },
        { filename: filename },
        function(err, str) {
          fs.outputFile(fsm.test_results_file_name, str, function(err) {
            if (err) {
              console.log(err);
              reject(err);
            }
            resolve();
          });
        }
      );
    }).catch(console.log);
  }

  open_test_results() {
    let fsm = this;
    return vscode.workspace
      .openTextDocument(vscode.Uri.file(fsm.test_results_file_name))
      .then(doc => vscode.window.showTextDocument(doc));
  }

  test() {
    let fsm = this;
    return AQ.get("/test/run/" + fsm.record.id)
      .then(result => {
        console.log(result.data);
        return result;
      })
      .then(result => fsm.write_test_results_file(JSON.parse(result.data)))
      .then(() => fsm.open_test_results());
  }

  get file_path() {
    return (
      this.context.storagePath +
      "/" +
      this.type +
      "/" +
      this.record.category +
      "/"
    );
  }

  get file_name() {
    let str = this.file_path;

    if (this.code_type == "library") {
      str += this.record.name;
    } else {
      str += this.record.name + "/" + this.code_type;
    }

    str += this.code_type == "documentation" ? ".md" : ".rb";
    console.log(str);
    return str;
  }

  code_status() {
    let fsm = this;
    if (!fs.existsSync(fsm.file_name)) {
      return Promise.resolve("no_local_copy");
    } else {
      if (fs.readFileSync(fsm.file_name, "utf8") == fsm.code) {
        return Promise.resolve("local_copy_matches");
      } else {
        console.log("LOCAL: " + fsm.file_name);
        console.log(fs.readFileSync(fsm.file_name, "utf8"));
        console.log("------------------------------");
        console.log("ON SERVER");
        console.log(fsm.code);
        return Promise.resolve("local_copy_differs");
      }
    }
  }

  write_file() {
    let fsm = this;
    return new Promise(function(resolve, reject) {
      fs.outputFile(fsm.file_name, fsm.code, function(err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  open_code() {
    let fsm = this;
    return vscode.workspace
      .openTextDocument(vscode.Uri.file(fsm.file_name))
      .then(doc => vscode.window.showTextDocument(doc));
  }

  say(msg) {
    return new Promise(function(resolve, reject) {
      vscode.window.showInformationMessage(msg);
      resolve();
    });
  }

  warn(msg) {
    return new Promise(function(resolve, reject) {
      vscode.window.showWarningMessage(msg);
      resolve();
    });
  }
}

module.exports = NemoFSM;
