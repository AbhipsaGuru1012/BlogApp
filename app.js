var express=require("express"),
	app=express(),
	mongoose=require("mongoose"),
	bodyParser=require("body-parser");
	methodOverride=require("method-override"),
	expressSanitizer=require("express-sanitizer")

mongoose.connect('mongodb://localhost/blog_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.set("view engine","ejs")
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer())//this should be placed after body-parser
app.use(methodOverride("_method"));
	
var blogSchema=new mongoose.Schema({
	title:String,
	image:String,
	body:String,
	created:{type: Date, Default: Date.now}//this is not working
});

var Blog=new mongoose.model("Blog", blogSchema);

app.get("/",function(req,res){
	res.redirect("/blogs");
})
//Index Route
app.get("/blogs",function(req, res){
	Blog.find({},function(err, blogs){
		if(err){
			console.log(err);
		}else{
			res.render("index",{blogs:blogs});		
		}
	})
	
})
//New Route
app.get("/blogs/new",function(req, res){
	res.render("new");
})
//Create Route
app.post("/blogs",function(req, res){
	req.body.blog.body=req.sanitize(req.body.blog.body)
	//create blog
	Blog.create(req.body.blog,function(err, newBlog){
		if(err){
			res.render("new");
		}else{
			//redirect to index
			res.redirect("/blogs")
		}
	})
})
//Show route
app.get("/blogs/:id",function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show",{blog:foundBlog})
		}
	})
})
//Edit route
app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit",{blog:foundBlog});	
		}
	})
	
})
//Update Route
app.put("/blogs/:id",function(req, res){
	req.body.blog.body=req.sanitize(req.body.blog.body)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs/:id/edit")
		}else{
			res.redirect("/blogs/"+req.params.id);
		}
	})
})
//Delete Route
app.delete("/blogs/:id",function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){//we don't need another parameter as it simply deletes the blog. We don't need to do anything with it
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs")
		}
	})
	
})
app.listen(3000,function(){
	console.log("Server is listening at port 3000");
})