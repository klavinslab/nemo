const AQ = require("./aquarium");
const vscode = require("vscode");
const provider = require("./aquarium_tree_provider");
const fs = require("fs-extra");
const NemoFSM = require("./nemo_fsm");

function activate(context) {
  let config = vscode.workspace.getConfiguration("nemo");

  AQ.config.aquarium_url = config.localAquariumServerUrl;

  function connect() {
    let operations_types = [];
    let libraries = [];

    AQ.login(config.localAquariumServerUser, config.localAquariumServerPassword)
      .then(() => AQ.OperationType.all())
      .then(ots => (operations_types = ots))
      .then(() => AQ.Library.all())
      .then(libs => (libraries = libs))
      .then(() => {
        for (var i = 0; i < operations_types.length; i++) {
          operations_types[i].fsms = {
            protocol: new NemoFSM(context, operations_types[i], "protocol"),
            precondition: new NemoFSM(
              context,
              operations_types[i],
              "precondition"
            ),
            documentation: new NemoFSM(
              context,
              operations_types[i],
              "documentation"
            ),
            test: new NemoFSM(context, operations_types[i], "test")
          };
        }
        for (var i = 0; i < libraries.length; i++) {
          libraries[i].fsm = new NemoFSM(context, libraries[i], "library");
        }
        vscode.window.showInformationMessage(
          "Found " + operations_types.length + " operation types"
        );
        vscode.window.registerTreeDataProvider(
          "aquariumTree",
          new provider.AquariumTreeProvider(operations_types, libraries)
        );
        initialized = true;
      })
      .catch(result => {
        console.log(result);
        vscode.window.showInformationMessage(result);
      });
  }

  function fsm(record, component) {
    if (record.record_type == "OperationType") {
      return record.fsms[component.toLowerCase()];
    } else {
      return record.fsm;
    }
  }

  function open(record, component) {
    if (record) {
      fsm(record, component).dispatch("open");
    } else {
      vscode.window.showInformationMessage(
        "Nemo is not yet initialized. Try again."
      );
    }
  }

  function pull(codeItem) {
    open(codeItem.record, codeItem.type);
  }

  function push(codeItem) {
    fsm(codeItem.record, codeItem.type.toLowerCase()).dispatch("push");
  }

  function status(codeItem) {
    fsm(codeItem.record, codeItem.type.toLowerCase()).dispatch("status");
  }

  function test(codeItem) {
    fsm(codeItem.record, codeItem.type.toLowerCase()).dispatch("test");
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.connect", connect)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.openCode", open)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.pullCode", pull)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.pushCode", push)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.showStatus", status)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.test", test)
  );

  connect();
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
