const loading = {
    template: "<div class=\"spinner\"><div class=\"rect1\"></div><div class=\"rect2\"></div><div class=\"rect3\"></div><div class=\"rect4\"></div><div class=\"rect5\"></div></div>"
}

Vue.component("loading", loading)
let NebPay = require("nebpay")
let nebPay = new NebPay()

const app = new Vue({
    el: "#app",
    data: {
        dapp_address: "n1qTwMkNVZJBeTc9eXE91zGxCSx6t39snaf",

        loading: false,
        search_keyword: "",
        todo_list: [],
        active_index: 0,
        active_item_index: null,
        edit_modal: false,
        active_item_content: ""
    },
    watch: {
        search_keyword: function () {
            this.active_index = 0
        }
    },
    computed: {
        filter_list: function () {
            let search_keyword = this.search_keyword

            return this.todo_list.filter(item => {
                if (search_keyword) {
                    if (item.title.indexOf(search_keyword) > -1) {
                        return true
                    }

                    // 检查条目有中没有符合的
                    return item.items.filter(item => {
                        if (item.content.indexOf(search_keyword) > -1) {
                            return true
                        }
                    }).length > 0

                }

                return item
            })
        },
        filter_items: function () {
            let search_keyword = this.search_keyword
            let items = this.active_list.items

            this.active_item_index = null

            return items.filter(item => {
                return item.content.indexOf(search_keyword) > -1
            })
        },
        active_list: function () {
            return this.filter_list[this.active_index]
        },
        wallet: function () {
            return !(typeof(webExtensionWallet) === "undefined")
        }
    },
    methods: {
        max_id: function (list) {
            let max_id = Math.max.apply(null, list.map((item) => item.id))

            return max_id > 0 ? max_id : 0
        },
        set_default_todolist: function () {
            this.todo_list = [
                {
                    id: 1,
                    title: "旅行",
                    subtitle: "诗和远方",
                    items: [
                        {
                            id: 1,
                            content: "购买去程机票"
                        },
                        {
                            id: 2,
                            content: "购买返程机票"
                        },
                        {
                            id: 3,
                            content: "预定酒店"
                        }
                    ]
                }
            ]
        },
        get_todolist: function () {
            this.loading = true

            nebPay.simulateCall(this.dapp_address, "", "get", "", {
                listener: (data) => {
                    this.loading = false

                    if (data.result) {
                        let result = JSON.parse(data.result)
                        let todolist = result.todo_list
                        this.todo_list = todolist
                    } else {
                        this.set_default_todolist()
                    }
                }
            })

        },
        save_todolist: function () {
            let data = JSON.stringify([this.todo_list])

            nebPay.call(this.dapp_address, 0, "save", data, {
                listener: (data) => {}
            })
        },
        add_todolist: function () {
            let todolist = {
                id: this.max_id(this.todo_list) + 1,
                title: "我的清单",
                subtitle: "需要在今天完成的事情",
                items: []
            }

            this.todo_list.push(todolist)

            this.active_index = Object.keys(this.todo_list).length - 1
        },
        delete_todolist: function () {
            let todolist = this.active_list

            this.todo_list.splice(this.todo_list.indexOf(todolist), 1)

            this.edit_modal = false
        },
        add_todolist_item: function () {
            let items = this.active_list.items

            items.push({
                id: this.max_id(items) + 1,
                content: this.active_item_content
            })

            this.active_item_content = ""
        },
        delete_todolist_item: function (id) {
            let items = this.active_list.items

            for (let i = 0; i < items.length; i++) {
                if (items[i].id === id) {
                    items.splice(i, 1)
                }
            }
        }

    },
    mounted: function () {
        this.get_todolist()
    }
})
