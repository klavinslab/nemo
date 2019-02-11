"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var vscode = require("vscode");
var path = require("path");
var AquariumTreeProvider = /** @class */ (function () {
    function AquariumTreeProvider(ots, libs) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.operation_types = ots;
        this.libraries = libs;
    }
    AquariumTreeProvider.prototype.refresh = function () {
        this._onDidChangeTreeData.fire();
    };
    AquariumTreeProvider.prototype.getTreeItem = function (element) {
        return element;
    };
    AquariumTreeProvider.prototype.getCategories = function (things, parent_type) {
        var categories = [], names = [];
        for (var i = 0; i < things.length; i++) {
            if (names.indexOf(things[i].category) < 0) {
                names.push(things[i].category);
            }
        }
        for (var i = 0; i < names.length; i++) {
            categories.push(new CategoryItem(names[i], parent_type, vscode.TreeItemCollapsibleState.Collapsed));
        }
        return categories;
    };
    AquariumTreeProvider.prototype.getChildren = function (element) {
        var provider = this;
        if (!element) {
            return new Promise(function (resolve, reject) {
                resolve([
                    new TopLevelItem("Operation Types", vscode.TreeItemCollapsibleState.Collapsed),
                    new TopLevelItem("Libraries", vscode.TreeItemCollapsibleState.Collapsed)
                ]);
            });
        }
        else if (element.is_top_level_item && element.label == "Operation Types") {
            return new Promise(function (resolve, reject) {
                resolve(provider.getCategories(provider.operation_types, "Operation Types"));
            });
        }
        else if (element.is_top_level_item && element.name == "Libraries") {
            return new Promise(function (resolve, reject) {
                resolve(provider.getCategories(provider.libraries, "Libraries"));
            });
        }
        else if (element.is_category_item && element.parent_type == 'Operation Types') {
            return new Promise(function (resolve, reject) {
                var ots = [];
                for (var i = 0; i < provider.operation_types.length; i++) {
                    if (provider.operation_types[i].category == element.label) {
                        ots.push(new OperationTypeItem(provider.operation_types[i], vscode.TreeItemCollapsibleState.Collapsed));
                    }
                }
                resolve(ots);
            });
        }
        else if (element.is_category_item && element.parent_type == 'Libraries') {
            return new Promise(function (resolve, reject) {
                var libs = [];
                for (var i = 0; i < provider.libraries.length; i++) {
                    if (provider.libraries[i].category == element.label) {
                        libs.push(new CodeItem(provider.libraries[i], "Library", vscode.TreeItemCollapsibleState.None));
                    }
                }
                resolve(libs);
            });
        }
        else if (element.is_operation_type_item) {
            return new Promise(function (resolve, reject) {
                resolve([
                    new CodeItem(element.operation_type, "Protocol", vscode.TreeItemCollapsibleState.None),
                    new CodeItem(element.operation_type, "Precondition", vscode.TreeItemCollapsibleState.None),
                    new CodeItem(element.operation_type, "Test", vscode.TreeItemCollapsibleState.None),
                    new CodeItem(element.operation_type, "Documentation", vscode.TreeItemCollapsibleState.None)
                ]);
            });
        }
    };
    return AquariumTreeProvider;
}());
exports.AquariumTreeProvider = AquariumTreeProvider;
var TopLevelItem = /** @class */ (function (_super) {
    __extends(TopLevelItem, _super);
    function TopLevelItem(name, collapsibleState, command) {
        var _this = _super.call(this, name, collapsibleState) || this;
        _this.name = name;
        _this.collapsibleState = collapsibleState;
        _this.command = command;
        _this.iconPath = {
            light: path.join(__filename, '..', 'resources', 'light', 'folder.svg'),
            dark: path.join(__filename, '..', 'resources', 'dark', 'folder.svg')
        };
        _this.contextValue = 'TopLevelItem';
        return _this;
    }
    Object.defineProperty(TopLevelItem.prototype, "is_top_level_item", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TopLevelItem.prototype, "tooltip", {
        get: function () {
            return "Expand";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TopLevelItem.prototype, "description", {
        get: function () {
            return "";
        },
        enumerable: true,
        configurable: true
    });
    return TopLevelItem;
}(vscode.TreeItem));
exports.TopLevelItem = TopLevelItem;
var CategoryItem = /** @class */ (function (_super) {
    __extends(CategoryItem, _super);
    function CategoryItem(name, parent_type, collapsibleState, command) {
        var _this = _super.call(this, name, collapsibleState) || this;
        _this.name = name;
        _this.parent_type = parent_type;
        _this.collapsibleState = collapsibleState;
        _this.command = command;
        _this.iconPath = {
            light: path.join(__filename, '..', 'resources', 'light', 'folder.svg'),
            dark: path.join(__filename, '..', 'resources', 'dark', 'folder.svg')
        };
        _this.contextValue = 'CategoryItem';
        return _this;
    }
    Object.defineProperty(CategoryItem.prototype, "is_category_item", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CategoryItem.prototype, "tooltip", {
        get: function () {
            return "Expand";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CategoryItem.prototype, "description", {
        get: function () {
            return "";
        },
        enumerable: true,
        configurable: true
    });
    return CategoryItem;
}(vscode.TreeItem));
exports.CategoryItem = CategoryItem;
var OperationTypeItem = /** @class */ (function (_super) {
    __extends(OperationTypeItem, _super);
    function OperationTypeItem(operation_type, collapsibleState, command) {
        var _this = _super.call(this, operation_type.name, collapsibleState) || this;
        _this.operation_type = operation_type;
        _this.collapsibleState = collapsibleState;
        _this.command = command;
        _this.iconPath = {
            light: path.join(__filename, '..', 'resources', 'light', 'optype.svg'),
            dark: path.join(__filename, '..', 'resources', 'dark', 'optype.svg')
        };
        _this.contextValue = 'OperationTypeItem';
        return _this;
    }
    Object.defineProperty(OperationTypeItem.prototype, "is_operation_type_item", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperationTypeItem.prototype, "tooltip", {
        get: function () {
            return "Expand";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OperationTypeItem.prototype, "description", {
        get: function () {
            return "";
        },
        enumerable: true,
        configurable: true
    });
    return OperationTypeItem;
}(vscode.TreeItem));
exports.OperationTypeItem = OperationTypeItem;
var CodeItem = /** @class */ (function (_super) {
    __extends(CodeItem, _super);
    function CodeItem(record, type, collapsibleState) {
        var _this = _super.call(this, type == "Library" ? record.name : type, collapsibleState) || this;
        _this.record = record;
        _this.type = type;
        _this.collapsibleState = collapsibleState;
        _this.command = {
            command: 'extension.openCode',
            title: 'Open ' + type,
            arguments: [record, type]
        };
        if (type == "Documentation") {
            _this.iconPath = {
                light: path.join(__filename, '..', 'resources', 'markdown.svg'),
                dark: path.join(__filename, '..', 'resources', 'markdown.svg')
            };
        }
        else {
            _this.iconPath = {
                light: path.join(__filename, '..', 'resources', 'ruby.svg'),
                dark: path.join(__filename, '..', 'resources', 'ruby.svg')
            };
        }
        if (type == "Test") {
            _this.contextValue = 'TestCodeItem';
        }
        else {
            _this.contextValue = 'CodeItem';
        }
        return _this;
    }
    Object.defineProperty(CodeItem.prototype, "is_code_item", {
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CodeItem.prototype, "tooltip", {
        get: function () {
            return "View code";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CodeItem.prototype, "description", {
        get: function () {
            return "";
        },
        enumerable: true,
        configurable: true
    });
    return CodeItem;
}(vscode.TreeItem));
exports.CodeItem = CodeItem;
