//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://klint:2007KawiZX6R@cluster0.3t21p.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name: "Welcome to your todo list"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const customListSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", customListSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

      if(foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }else{
            console.log("insert complete");
          }
        });
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(req.body.list);

  const item = new Item ({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkboxID = (req.body.checkbox);
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkboxID, function(err){
      if(!err){
        console.log("removed " + checkboxID);
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkboxID}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create new list
        console.log("does not exist");

        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      }else{
        //Show existing list
        console.log("does exist");

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }else{
      console.log(err);
    }
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server started on port " + port);
});
