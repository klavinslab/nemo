import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class AquariumTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<vscode.TreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;
	private operation_types;
	private libraries;

	constructor(ots,libs) {
		this.operation_types = ots;
		this.libraries = libs;
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		return element;
    }
	
	getCategories(things, parent_type) {
		let categories = [],
		    names = [];
		for(var i=0;i<things.length;i++) {
			if ( names.indexOf(things[i].category) < 0) {
				names.push(things[i].category);
			}
		}
		for(var i=0;i<names.length;i++) {
     		categories.push(new CategoryItem(names[i],parent_type,vscode.TreeItemCollapsibleState.Collapsed));
		}
		return categories;
	}

	getChildren(element?: any): Thenable<vscode.TreeItem[]> {

		let provider = this;
		
		if ( !element ) {
			return new Promise(function(resolve,reject) {
				resolve([
					new TopLevelItem("Operation Types",vscode.TreeItemCollapsibleState.Collapsed), 
					new TopLevelItem("Libraries",vscode.TreeItemCollapsibleState.Collapsed)
				]);
			});
		} else if ( element.is_top_level_item && element.label == "Operation Types" ) {
			return new Promise(function(resolve,reject) {
				resolve(provider.getCategories(provider.operation_types, "Operation Types"));
			});
		} else if ( element.is_top_level_item && element.name == "Libraries" ) {
			return new Promise(function(resolve,reject) {
				resolve(provider.getCategories(provider.libraries, "Libraries"));
			});
		} else if ( element.is_category_item && element.parent_type == 'Operation Types' ) {
            return new Promise(function(resolve, reject) {
                let ots = [];
                for ( var i=0; i<provider.operation_types.length; i++ ) {
                    if ( provider.operation_types[i].category == element.label ) {
						ots.push(new OperationTypeItem(provider.operation_types[i], vscode.TreeItemCollapsibleState.Collapsed))
					}
                }
                resolve(ots);
            })			
		} else if ( element.is_category_item && element.parent_type == 'Libraries' ) {			
            return new Promise(function(resolve, reject) {
                let libs = [];
                for ( var i=0; i<provider.libraries.length; i++ ) {
                    if ( provider.libraries[i].category == element.label ) {
						libs.push(new CodeItem(provider.libraries[i], "Library", vscode.TreeItemCollapsibleState.None))
					}
                }
                resolve(libs);
            })
		} else if ( element.is_operation_type_item ) {
            return new Promise(function(resolve,reject) {
                resolve([
					new CodeItem(element.operation_type, "Protocol",	  vscode.TreeItemCollapsibleState.None),
					new CodeItem(element.operation_type, "Precondition",  vscode.TreeItemCollapsibleState.None),
					new CodeItem(element.operation_type, "Test",          vscode.TreeItemCollapsibleState.None),
					new CodeItem(element.operation_type, "Documentation", vscode.TreeItemCollapsibleState.None)
				]);
            })
		}

	}

}

export class TopLevelItem extends vscode.TreeItem {

	constructor(
		public readonly name: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(name, collapsibleState);
	}

	get is_top_level_item() { return true; }

	get tooltip(): string {
		return `Expand`;
	}

	get description(): string {
		return "";
	}

	iconPath = {
		light: path.join(__filename, '..', 'resources', 'light', 'folder.svg'),
		dark: path.join(__filename, '..', 'resources', 'dark', 'folder.svg')
	};

	contextValue = 'TopLevelItem';

}

export class CategoryItem extends vscode.TreeItem {

	constructor(
		public readonly name: string,
		public readonly parent_type: string,		
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(name, collapsibleState);
	}

	get is_category_item() { return true; }

	get tooltip(): string {
		return `Expand`;
	}

	get description(): string {
		return "";
	}

	iconPath = {
		light: path.join(__filename, '..', 'resources', 'light', 'folder.svg'),
		dark: path.join(__filename, '..', 'resources', 'dark', 'folder.svg')
	};

	contextValue = 'CategoryItem';

}

export class OperationTypeItem extends vscode.TreeItem {

	constructor(
		public readonly operation_type: object,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(operation_type.name, collapsibleState);
	}

	get is_operation_type_item() { return true; }		

	get tooltip(): string {
		return `Expand`;
	}

	get description(): string {
		return "";
	}

	iconPath = {
		light: path.join(__filename, '..', 'resources', 'light', 'optype.svg'),
		dark: path.join(__filename, '..', 'resources', 'dark', 'optype.svg')
	};

	contextValue = 'OperationTypeItem';

}

export class CodeItem extends vscode.TreeItem {

	constructor(
        public readonly record: object,
		public readonly type: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {

		super(type == "Library" ? record.name : type, collapsibleState);
		
        this.command = {
            command: 'extension.openCode',
            title: 'Open ' + type,
            arguments: [record, type]
		}
		
		if ( type == "Documentation" ) {
			this.iconPath = {
				light: path.join(__filename, '..', 'resources', 'markdown.svg'),
				dark: path.join(__filename, '..', 'resources', 'markdown.svg')
			};	
		} else {
			this.iconPath = {
				light: path.join(__filename, '..', 'resources', 'ruby.svg'),
				dark: path.join(__filename, '..', 'resources', 'ruby.svg')
			};				
		}

		if ( type == "Test" ) {
			this.contextValue = 'TestCodeItem';
		} else {
			this.contextValue = 'CodeItem';
		}

	}	

	get is_code_item() { return true; }	

	get tooltip(): string {
		return `View code`;
	}

	get description(): string {
		return "";
	}

}