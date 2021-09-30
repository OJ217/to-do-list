//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

mongoose.connect("mongodb://localhost:27017/todolistpracticeDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todoList!"
});

const listsSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listsSchema);

const defaultItem = [item1];

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res)=>{
    Item.find({}, (err, foundItems)=>{
        if(foundItems.length == 0) {
            Item.insertMany(defaultItem, (err)=>{
                if(err) {
                    console.log(err);
                    res.redirect("/");
                } else {
                    res.redirect("/");
                };
            });
        } else {
            res.render("list", {
                listTitle: "Today",
                listItems: foundItems
            });
        };
    });
});

app.get("/:requestedListName", (req, res)=>{
    const requestedListName = _.capitalize(req.params.requestedListName);

    List.findOne({name: requestedListName}, (err, foundList)=>{
        if(!err){
            if(!foundList) {
                const newList = new List({
                    name: requestedListName,
                    items: defaultItem
                });

                newList.save();
                res.redirect("/"+requestedListName);
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    listItems: foundList.items
                });
            };
        } else {
            console.log(err);
        };
    });
});

app.post("/", (req, res)=>{
    const itemName = req.body.itemName;
    const listName = req.body.list;

    const newItem = new Item({
        name: itemName
    });

    if(listName==="Today"){
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, (err, foundList)=>{
            if(!err) {
                foundList.items.push(newItem);
                foundList.save();
                res.redirect("/"+listName);
            } else {
                console.log(err);
                res.redirect("/"+listName);
            };
        });
    };
});

app.post("/delete", (req, res)=>{
    const listName = req.body.listName;
    const checkedItemdId = req.body.checkbox;

    if(listName === "Today") {
        Item.findByIdAndDelete(checkedItemdId, (err)=>{
            if(!err){
                res.redirect("/");
            } else {
                console.log(err);
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate(
            {name: listName},
            {$pull: {items: {_id: checkedItemdId}}},
            (err, foudnList) =>{
                if(!err){
                    res.redirect("/"+listName);
                } else {
                    console.log(err);
                    res.redirect("/"+listName);
                }
            }
        );
    };
});

app.get("/about", (req, res)=>{
    res.render("about");
});

app.listen(3000, ()=>{
    console.log("Server is up and running on port 3000.");
});