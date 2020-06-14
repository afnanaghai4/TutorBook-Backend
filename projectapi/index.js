require('dotenv').config()

const mysql = require("mysql");
const cors = require("cors");
var mysqlconn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'bookatutor',
    multipleStatements: true

})
const jwt = require("jsonwebtoken")
const express = require("express");
const app = express();
const bodypar = require("body-parser");
const passport = require("passport")
var session = require('express-session');
app.use(cors())
app.use(bodypar.json())
mysqlconn.connect((err) => {
    if (!err) {
        console.log("connected successfully")
    } else {
        console.log("error" + JSON.stringify(err, undefined, 2));
    }
})
const port = 4000;
app.listen(port, () => { console.log(`express running at port ${port}`) });




//puts data in the db
app.post("/signuptutor", (req, res) => {
    {
        let emp = req.body;
        console.log(req.body)
        var sql = `INSERT INTO users(fullname,email,password,qualification,area,contact,role_id) VALUES(?,?,?,?,?,?,1)`
        var val = [emp.fullname, emp.email, emp.password, emp.qualification, emp.area, emp.contact]
        mysqlconn.query(sql, val, (err, row, fields) => {
            if (!err) {
                console.log(row)
            } else {
                console.log(err)
            }
        })
    }
})

app.post("/signupfinder", (req, res) => {
    {
        let emp = req.body;
        console.log(req.body)
        var sql = `INSERT INTO users(fullname,email,password,qualification,area,contact,role_id) VALUES(?,?,?,?,?,?,2)`
        var val = [emp.fullname, emp.email, emp.password, emp.qualification, emp.area, emp.contact]
        mysqlconn.query(sql, val, (err, row, fields) => {
            if (!err) {
                console.log(row)
            } else {
                console.log(err)
            }
        })
    }
})



//login authentication
app.post("/login", (req, res) => {
    {
        let emp = req.body
      

        var val = [emp.email, emp.password]
        mysqlconn.query(`SELECT * FROM users where email = ? and password=?`, val, (err, row, fields) => {
            if (row.length > 0) {
                if(row[0].role_id == 1){
             const user={
                 id:row[0].user_id,
                 name:row[0].fullname,
                 email:row[0].email}

                jwt.sign({user},'secretkey',(err,token)=>
             
                { var status1="customer";
                 res.json({token,status1});

             }
             )


            }
            else if(row[0].role_id == 2){
                const user={
                    id:row[0].user_id,
                    name:row[0].fullname,
                    email:row[0].email}
   
                   jwt.sign({user},'tutorkey',(err,token)=>
                
                   { var status1="finder";
                    res.json({token,status1});
   
                }
                )
            }

            else if(row[0].role_id == 3){
                const user={
                    id:row[0].user_id,
                    name:row[0].fullname,
                    email:row[0].email}
   
                   jwt.sign({user},'adminkey',(err,token)=>
                
                   { var status1="admin";
                    res.json({token,status1});
   
                }
                )
            }
                
            } else {
                var status1="fail"
                res.json(status1)

}})}})


//get all tutions 
app.get('/dashboard', (req, res) => {
 
    mysqlconn.query("SELECT * FROM tutions where request = true", (err, row, fields) => {
        if (!err) {
            res.send(row)
        } else {
            console.log(err)
        }
    })
})




//get a specific user a/c to the id
app.get('/profiles',verifyToken,(req, res) => {
    jwt.verify(req.token,'secretkey',(errs,authData)=>{
if(errs){
    
} else{
    mysqlconn.query(`SELECT * FROM users WHERE user_id=?`,[authData.user.id],(err,row,fields) => {
        if(!err){
            
            res.send(row)
            console.log(row)
            console.log("chl rha hai bhai")
        }else{
           
        }
    })}
})
})



function verifyToken(req,res,next){
    const header = req.headers['authorization']
    if(typeof header !== 'undefined'){
        console.log('hello')
        req.token=header;
        next();
    }else{
        console.log('error')
    }
}


app.post('/addbooking',verifyToken,(req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err){

        }else{
            let emp = req.body
                  mysqlconn.query(`INSERT INTO booking(user_id,tution_id,request,request1) VALUES(?,?,false,false)`,[authData.user.id,emp.tution_id],(err,row,fields)=>{
                if(!err){
                    console.log(row)
                    
                }else{
                    console.log(err)
                    console.log(authData.user.id)
                }
            })
        }
    })
})



//edit profile
app.put('/editprofile',verifyToken,(req,res) => {
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err){
        }else{

            let emp = req.body
           
            mysqlconn.query(`UPDATE users 
            SET 
                fullname = case when ? <> '' then ? else email end, 
                email = case when ? <> '' then ? else email end, 
                password = case when ? <> '' then ? else password end,
                contact = case when ? <> '' then ? else contact end,
                qualification = case when ? <> '' then ? else qualification end,
                charge = case when ? <> '' then ? else charge end,
                city = case when ? <> '' then ? else city end,
                area = case when ? <> '' then ? else area end
            WHERE user_id = ?;`,
            [emp.fullname,emp.fullname,
                emp.email,emp.email,
                emp.password,emp.password,
                emp.contact,emp.contact,
                emp.qualification,emp.qualification,
                emp.charge,emp.charge,
                emp.city,emp.city,
                emp.area,emp.area,
                authData.user.id],(err,row,fields)=>{
                if(!err){
                    console.log("updated successfully")
        }else{
            console.log(err)
        }
    })
}
})
})


//get details of a specific tution
app.get('/tutiondetails/:id', (req, res) => {
    
    mysqlconn.query("SELECT * FROM tutions where tution_id = ? ",[req.params.id] ,(err, row, fields) => {
        if (!err) {
            console.log(req.params.id)
            res.send(row)
            console.log("chl rha hai")
            console.log(row)
        } else {
            console.log(err)
            console.log("nhi chl rha")
        }
    })
})



//show bookings of tutor
app.get('/booking1',verifyToken,(req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err){
            console.log(err)
        }else{

            let emp = req.body

            mysqlconn.query(`SELECT * FROM tutions,booking 
            Where user_id=11 
            AND tutions.tution_id=booking.tution_id
            AND booking.request = TRUE
            AND booking.request1 = true

            `,[authData.user.id],(err,row,fields)=>{
                if(!err){
                    res.send(row)
                   
                }else{
                    console.log(err)
                    
                }
            })
        }
    })
})

app.get('/booking2',verifyToken,(req,res)=>{
    jwt.verify(req.token,'secretkey',(err,authData)=>{
        if(err){
            console.log(err)
        }else{

            let emp = req.body

            mysqlconn.query(`SELECT * FROM tutions,booking 
            Where user_id=11 
            AND tutions.tution_id=booking.tution_id
            AND booking.request = true
            AND booking.request1 = false

            `,[authData.user.id],(err,row,fields)=>{
                if(!err){
                    res.send(row)
                   
                }else{
                    console.log(err)
                    
                }
            })
        }
    })
})

//get contact of the person finding the tution
app.get('/contact/:id',(req,res)=>{
    let emp = req.body

    mysqlconn.query(`select * from users where user_id = ?`,[req.params.id],(err,row,fields)=>{
        if(!err){
            res.send(row)
            console.log(row)
        }else{
            console.log(err)
        }
    })
})




                    /*             ADMIN SIDE API'S                */ 

//display all users on adminpanel
app.get('/adminusers',(req,res)=>{
    
    mysqlconn.query(`select * from users where role_id = 1 or role_id = 2 `,(err,row,fields)=>{
        if(!err){
            res.send(row)
            
        }else{
            console.log(err)
        }
    })
})



//delete user from admin panel
app.delete('/users/:id',(req,res)=>{
    let emp = req.body
    
    mysqlconn.query(`delete from users where user_id = ?`,[req.params.id],(err,row,fields)=>{
        if(!err){
            console.log(row)
            console.log('deleted successfully')
        }else{
            console.log(err)
            
        }
        
    })
})


//shows all bookings of the site
app.get('/bookingshow',(req,res)=>{
    mysqlconn.query(`SELECT * FROM booking`,(err,row,fields)=>{
        if(!err){
            res.send(row)
            console.log("chal rha hai bookingsadmin")
        }else{
            console.log(err)
        }
    })
})


//delete bookings from admin panel
app.delete('/bookingdelete/:id',(req,res)=>{
    let emp = req.body
    
    mysqlconn.query(`delete from booking where booking_id = ?`,[req.params.id],(err,row,fields)=>{
        if(!err){
            console.log(row)
            console.log('deleted successfully')
        }else{
            console.log(err)
            
        }
        
    })
})

//show details of single booking in admin
app.get('/bookingshow/:id',(req,res)=>{
    let emp = req.body

    mysqlconn.query(`select t.studentname,t.fee,t.grade,t.area,u.fullname from tutions t,booking b,users u 
    where booking_id = ? and t.tution_id = b.tution_id and u.user_id = b.user_id`,[req.params.id],(err,row,fields)=>{
        if(!err){
            res.send(row)
            console.log("hr booking ki detail show ho rhi ha")
            
        }else{
            console.log(err)
        }
    })
})

//shows all tutions for approval
app.get('/tutionapproval',(req,res)=>{
    mysqlconn.query(`SELECT * FROM tutions where request = false`,(err,row,fields)=>{
        if(!err){
            res.send(row)
            console.log("chal rha hai tution approval")
            console.log(row)
        }else{
            console.log(err)
        }
    })
})


//shows all tutions for approval
app.put('/tutionapproved/:id',(req,res)=>{
    mysqlconn.query(`update tutions set request = 1 where tution_id = ?`,[req.params.id],(err,row,fields)=>{
        if(!err){
            console.log("updated successfully")
            
        }else{
            console.log(err)
        }
    })
})

//shows all bookings for approval
app.get('/bookingapproval',(req,res)=>{
    mysqlconn.query(`select * from booking where request = 0`,(err,row,fields)=>{
        if(!err){
            res.send(row)
            console.log("it is working")
        }else{
            console.log(err)
        }
    })
})

//shows specific booking for approval
app.get('/bookingapproval/:id',(req,res)=>{
    mysqlconn.query(`select * from tutions,booking where booking_id = ? and tutions.tution_id = booking.tution_id`,[req.params.id],(err,row,fields)=>{
        if(!err){
            res.send(row)
            console.log("it is working")
            
        }else{
            console.log(err)
        }
    })
})

//shows booking for approval
app.put('/bookingapprove/:id',(req,res)=>{
    mysqlconn.query(`update booking set request = 1 where booking_id = ?`,[req.params.id],(err,row,fields)=>{
        if(!err){
            console.log("updated successfully")
            
        }else{
            console.log(err)
        }
    })
})


app.post('/dashboardspecific', (req, res) => {
 let emp=req.body
 console.log(emp.area)
    mysqlconn.query("SELECT * FROM tutions where request = true AND area LIKE ?", [emp.area] + "%" , (err, row, fields) => {
        if (!err) {
            console.log("hellosadsda")
            console.log(emp.area)
            
        } else {
            console.log(err)
        }
    })
})

//get all tutors on tutorfinder dashboard
app.get('/dashboard2', verifyToken,(req, res) => {
    jwt.verify(req.token,'tutorkey',(err,authData)=>{
        if(err){
            console.log(err)
        }
        else{
    mysqlconn.query("SELECT * FROM users where role_id =1", (err, row, fields) => {
        if (!err) {
            res.send(row)
            console.log(row)
        } else {
            console.log(err)
        }
    }
    )
}
    })
})

                                /*          TUTOR FINDER API'S          */ 


//get details of a specific tution
app.get('/tutordetails/:id', (req, res) => {
    
    mysqlconn.query("SELECT * FROM users where user_id = ? ",[req.params.id] ,(err, row, fields) => {
        if (!err) {
            console.log(req.params.id)
            res.send(row)
            console.log("chl rha hai")
            console.log(row)
        } else {
            console.log(err)
            console.log("nhi chl rha")
        }
    })
})

//display all finder's tutions
app.get('/tutiondisplay1',verifyToken,(req, res)=>{
    jwt.verify(req.token,'tutorkey',(err,authData)=>{
        if(err){
           
        }else{
            let emp = req.body
                  mysqlconn.query("select * from tutions where finder=? and request=1",[authData.user.id],(err,row,fields)=>{
                if(!err){
                    res.send(row)
                }else{
                    console.log(err)
                }
            })
        }
    })
})

//display all finder's tutions
app.get('/tutiondisplay2',verifyToken,(req, res)=>{
    jwt.verify(req.token,'tutorkey',(err,authData)=>{
        if(err){
           
        }else{
            let emp = req.body
                  mysqlconn.query("select * from tutions where finder=? and request=0",[authData.user.id],(err,row,fields)=>{
                if(!err){
                    res.send(row)
                }else{
                    console.log(err)
                }
            })
        }
    })
})

app.post("/tutionform",verifyToken,(req,res)=>{
    jwt.verify(req.token,'tutorkey',(err,authData)=>{
        if(err){
            console.log(err)
        }else{
            let emp = req.body
            mysqlconn.query(`insert into tutions(studentname,grade,fee,city,area,duration,finder,startingdate,request)
            values(?,?,?,'karachi',?,?,?,?,false)`,
            [emp.studentname,emp.grade,emp.fees,emp.area,emp.duration,authData.user.id,emp.startingdate],(err,row,fields)=>{
                if(!err){
                    console.log(row)
                    console.log("tution posted")
                }else{
                    console.log(err)
                }
            })
        }
    })
})

//display tutor approvals for tutions
app.get('/tutorapproval',verifyToken,(req, res)=>{
    jwt.verify(req.token,'tutorkey',(err,authData)=>{
        if(err){
           
        }else{
            let emp = req.body
                  mysqlconn.query(`select * from users,booking,tutions 
                  where tutions.tution_id=booking.tution_id 
                  and users.user_id = booking.user_id 
                  and booking.request = true
                  and booking.request1 = false
                  and tutions.finder=?`,[authData.user.id],(err,row,fields)=>{
                if(!err){
                    res.send(row)
                }else{
                    console.log(err)
                }
            })
        }
    })
})


app.put('/approvebooking/:id',verifyToken,(req, res)=>{
    jwt.verify(req.token,'tutorkey',(err,authData)=>{
        if(err){
           console.log(err)
        }else{
            let emp = req.body
                  mysqlconn.query(`update booking set request1=true where booking_id=?`,[req.params.id],(err,row,fields)=>{
                if(!err){
                    console.log(row)
                   
                }else{
                    console.log(err)
                }
            })
        }
    })
})


