"use strict";

let TodoListItem = function (data) {
    if (data) {
        data = JSON.parse(data);

        this.todo_list = data.todo_list;
    } else {
        this.todo_list = [];
    }
}

TodoListItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}

let TodoList = function () {
    LocalContractStorage.defineMapProperty(this, "todo_list", {
        parse: function (data) {
            return new TodoListItem(data);
        },
        stringify: function (data) {
            return data.toString();
        }
    })
}

TodoList.prototype = {
    init: function () {},

    get: function () {
        let from = Blockchain.transaction.from;
        
        return this.todo_list.get(from);
    },
    save: function (value) {
        let from = Blockchain.transaction.from;

        let item = new TodoListItem();
        item.todo_list = value;

        this.todo_list.put(from, item);

        return "success";
    }
}

module.exports = TodoList;