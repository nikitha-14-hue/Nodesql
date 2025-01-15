const express=require("express");
const app=express();
const { faker } = require('@faker-js/faker');
const methodOverride=require("method-override");
const { v4: uuidv4 } = require("uuid");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
let port=8080;
let path=require("path");
const mysql=require("mysql2");
const connection =  mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "node",
    password:"123456",
  });
  app.set("views engine","ejs");
  app.set("views",path.join(__dirname,"/views"));
  let data=[];
  let getRandomUser=() =>{
    return [
      faker.string.uuid(),
       faker.internet.username(), // before version 9.1.0, use userName()
     faker.internet.email(),
       faker.internet.password(),
      
    ];
  }
  for(let i=1;i<=100;i++)
  {
    data.push(getRandomUser());
  }
 

  let q="insert into user (userId,username,email,password) values ?";
//   let user=[["1","niks","niks@gmail.com","123456"]];
//   try{
//   connection.query(q,[data],(err,result)=>
// {
//     if(err) throw err;
//     console.log(result);
// });
// }
//   catch(err)
//   {
//     console.log(err);
//   }
//   connection.end(); commented as we have already added 100 fake data
app.listen(port,(req,res)=>
{
    console.log(`listening to port ${port}`);
})
 app.get("/",(req,res)=>
{
    let q=`select count(*) from user`;
    try{
        connection.query(q,(err,result)=>
        {
            if(err) throw err;
           let count= result[0]["count(*)"];
            res.render("home.ejs",{count});
        })
    }
    catch(err)
    {
        res.send("error occoured");
    }
    
})
app.get("/users",(req,res)=>
{
    let q=`select * from user`;
  
    try{
        connection.query(q,(err,users)=>
        {
            if(err) throw err;
            
            res.render("user.ejs",{users});
        })
    }
    catch(err)
    {
        res.send("some unknown error occoured");
    }
})
app.get("/user/:id/edit",(req,res)=>
{
    let {id}=req.params;
    let q=`select * from user where userId='${id}'`;
    try{
        connection.query(q,(err,result)=>
        {
            if(err) throw err;

           let user=result[0];
           console.log(user);
            res.render("editform.ejs",{user});
        })
    }
    catch(err)
    {
        res.send("some unknown error occoured");
    }
 
})
app.patch("/user/:id",(req,res)=>
{
   let {id}=req.params;
   let {password:formpass,username:newusername}=req.body;
    let q=`select * from user where userId='${id}'`;
    try{
        connection.query(q,(err,result)=>
        {
            if(err) throw err;
                    let user=result[0];
                   
                    if(formpass!=user.password)
                    {
                        res.send("wrong password");
                    }
                    else{
                        let q2=`update user set username='${newusername}' where userId='${id}'`;
                        connection.query(q2,(err,result)=>
                        {
                            if(err) throw err;
                            res.redirect("/users");
                        });
                    }
        })
    }
    catch(err)
    {
        res.send("some unknown error occoured");
    }
 
})
//form for adding new user
app.get("/user/newform",(req,res)=>
{
    res.render("newform.ejs");

})
app.post("/users/newform",(req,res)=>
{
    //get a form after clicking add new user
    
    let{username,email,password}=req.body;
    let userId=uuidv4();
   
    // let q=`insert into user (userId,username,email,password) values ('${userId}','${username}','${email}','${password}') `;
    let q = `INSERT INTO user (userId, username, email, password) VALUES ('${userId}','${username}','${email}','${password}') `;

    try
    {
        
        connection.query(q,(err,result)=>{
            if (err) throw err;
            console.log("added new user");
            res.redirect("/users");
        })
    }
    catch(err){
        res.send("some error");
    }
})

