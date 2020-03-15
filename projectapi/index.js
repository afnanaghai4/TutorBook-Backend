const mysql = require("mysql");
const cors = require("cors");
var mysqlconn = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'admin',
    database:'bookatutor',
    multipleStatements: true

})

const express= require("express");
const app=express();
const bodypar = require("body-parser");
var session = require('express-session');
app.use(cors())
app.use(bodypar.json())
mysqlconn.connect((err) => {
    if(!err){
        console.log("connected successfully")
    }else{
        console.log("error" + JSON.stringify(err,undefined,2));
    }
})

app.listen(4000,()=> {console.log("express running at port 4000")});





 app.post("/signup",(req,res)=>{
   {
    let emp = req.body;
     console.log(req.body)
     var sql = `INSERT INTO users(fullname,email,password,qualification,area,contact,role_id) VALUES(?,?,?,?,?,?,?)`
     var val = [emp.fullname,emp.email,emp.password,emp.qualification,emp.area,emp.contact,emp.role_id]
     mysqlconn.query(sql,val,(err,row,fields)=>{
         if(!err){
             console.log(row)
         }else{
             console.log(err)
         }
     })
 }
})
