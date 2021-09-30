//jshint: esversion6

const express = require("express");
const app = express();
const _ = require("lodash");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

//Database

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Welcome to your to do list!"
});

const item2 = new Item ({
    name: "Hit the + button to add a new item."
});

const item3 = new Item ({
    name: "<-- Hit this to delete an item."
})

const defaultItems = [item1];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//Routing

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));  

app.get("/", (req, res)=>{

    // let today = date.getDate();

    Item.find({}, (err, foundItems) => {
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, (err)=>{
                if (err) {
                    console.log(err);
                } else {
                    console.log("Succesfully saved the default items to DB");
                    res.redirect("/");
                }
            });
        } else {
            res.render("list", {
                listTitle: "Today",
                listItems: foundItems
            });
        };
    });

});

app.post("/", (req, res)=>{
    let itemName = req.body.itemName;
    let listName = req.body.list;

    const item = new Item ({
        name: itemName
    });

    if(listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, (err, foundItem)=>{
             foundItem.items.push(item);
             foundItem.save();
             res.redirect("/" + listName);
        });
    };
});

app.post("/delete", (req, res)=>{
    const checkedItemdId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndDelete(checkedItemdId, (err)=>{
            if (!err) {
                res.redirect("/");
            } else {
                console.log(err);
                res.redirect("/");
            };
        });
    } else {
        List.findOneAndUpdate(
            {name: listName}, 
            {$pull: {items: {_id: checkedItemdId}}}, 
            (err, foundList)=>{
                if(!err){
                    res.redirect("/"+listName);
                } else {
                    console.log(err);
                    res.redirect("/"+listName);
                };
        });
    };
});

app.get("/:requestedListName", (req, res)=>{
    const requestedListName = _.capitalize(req.params.requestedListName);

    List.findOne({name: requestedListName}, (err, foundList)=>{
        if (!err) {
            if(!foundList) {
                // console.log("The list doesn't exist.");
                //Create a list
                const list = new List({
                    name: requestedListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + requestedListName);
            } else {
                // console.log("The list exists.");
                //Show an existing list
                res.render("list", {
                    listTitle: foundList.name,
                    listItems: foundList.items
                });
            }
        } else {
            console.log(err);
        }
    });
});

app.get("/about", (req, res)=>{
    res.render("about");
});

app.listen(3000, ()=>{
    console.log("Server is up and running on port 3000");
});