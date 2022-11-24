var express = require('express');
const connection = require('./utils/conn')
const thgconn = require('./utils/thgconn');

var bodyParser = require('body-parser');

var app = express();

var validateResponse = [];
var totalRooms;
var occupiedRooms;

var branchTotal;
var branchOcp;
var branchVacant;

function pushToResponse(name, val) {
    var obj = {};
    obj[name] = val;
    validateResponse.push(obj);
 }

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Welcome to ASL hosting");
});

app.get("/asl", (req, res) => {
    console.log("Athulya Senior Care");
    res.send("Harish");
});

app.get("/login", (req, res) => {
    console.log("Inside login");
    
    connection.query('SELECT user_id FROM users', function (error, results, fields) {
        if (error) throw error;
        console.log('The result is: ', results[0]);
        var usr_id = results[0];
        // res.send(usr_id);
    });
});


app.post("/testlogin/validate", function(req, res) {
    console.log('receiving data...');
    var eid = req.body.employeeid;
    var epwd = req.body.password;
    
    var countQuery = `SELECT COUNT(name) AS numrows FROM login WHERE emp_id = '${eid}' and password = '${epwd}'`;
    
    connection.query(countQuery, (err, results, fields) => {
        if(err) throw err;
        var obj = {};
        
        if(results[0].numrows == 0) {
            obj['message'] = "Failure";
        }
        else if(results[0].numrows == 1) {
            obj['message'] = "Success";
        }
        obj['data'] = req.body;
        res.send(obj);       
    })
});

app.post("/login/validate", function(req, res) {
    console.log('receiving data...');
    var eid = req.body.employeeid;
    var epwd = req.body.password;
    
    var selectQuery = `SELECT * FROM login WHERE emp_id = '${eid}' and password = '${epwd}'`;
    
    connection.query(selectQuery, (err, results, fields) => {
        if(err) throw err;
        var obj = {};      
        obj['data'] = {};
        
        if(results[0] == null) {
            obj['message'] = "Failure";
            obj['data']['employeeid'] = req.body.employeeid;
            obj['data']['dept'] = 'Invalid';
            obj['data']['name'] = 'Invalid';
        }
        else {
            obj['message'] = "Success";
            obj['data']['employeeid'] = req.body.employeeid;
            obj['data']['dept'] = results[0].dept;
            obj['data']['name'] = results[0].name;
        }
        
        res.send(obj);       
    })    
});

app.post("/login/val", (req, res) => {
    var eid = req.body.employeeid;
    var epwd = req.body.password;

    console.log(eid);
    console.log(epwd);
    var selectQuery = `SELECT * FROM login WHERE emp_id = '${eid}' and password = '${epwd}'`;
    
    connection.query(selectQuery, (err, results, fields) => {
        if(err) throw err;
        // console.log(results);
        res.send(results[0].name);
    })
    
});

app.post("/login/id", (req, res) => {
    var eid = req.body.employeeid;

    console.log(eid);

    var selectQuery = `SELECT * FROM login WHERE emp_id = '${eid}'`;
    connection.query(selectQuery, (err, results, fields) => {
        var object = {};
        if(err) throw err;
        if(results[0] == null) {
            object['status'] = "Invalid";
            object['name'] = "Invalid";
            object['dept'] = "Invalid";
        }
        else {
            object['status'] = "Success";
            object['name'] = results[0].name;
            object['dept'] = results[0].dept;
        }
        console.log(results[0]);
        res.send(object);
    });
});

app.get("/occupancy/count", (req, res) => {
    var totalQuery = `SELECT COUNT(*) AS total FROM master_beds mb WHERE mb.room_id IN(SELECT mr.id FROM master_rooms mr)`;
    var ocpQuery = `SELECT COUNT(*) AS ocp from patient_schedules ps where ps.patient_id in (select DISTINCT(patient_id) from leads) and ps.status!='Cancelled' and ps.schedule_date=curdate()`;

    var total;
    var occupied;

    thgconn.query(totalQuery, (err, results, fields) => {
        if(err) throw err;
        totalRooms = results[0].total;

        total = setTotalRooms(results);
    });


    thgconn.query(ocpQuery, (err, results, fields) => {
        if(err) throw err;

        occupied = setOccupiedRooms(results);
        var data = {};
        data['total'] = total;
        data['occupied'] = occupied;
        data['vacant'] = getVacantRooms();

        res.json(data);
    });

});

app.get("/occupancy/count/:id", (req, res) => {
    var branch = req.params.id;
    var branch_id;
    
    switch (branch) {
        case "Perungudi":
            branch_id = 1;
            break;
        case "Arumbakkam":
            branch_id = 2;
            break;
        case "Neelankarai":
            branch_id = 3;
            break;
        case "Pallavaram":
            branch_id = 4;
            break;
        case "Kasavanahalli":
            branch_id = 5;
            break;
        default:
            branch_id = 999;
            break;
    }

    /* if(branch_id == 999) {
        // throw "Invalid Branch Name";
        res.json("Invalid Branch Name");
    } */

    var branchCountQuery = `SELECT COUNT(*) AS branch_count FROM master_rooms WHERE branch_id = ${branch_id}`;
    var branchOccupiedQuery = `SELECT COUNT(*) AS ocp_count from patient_schedules ps where ps.patient_id in (select DISTINCT(patient_id) from leads WHERE branch_id = ${branch_id}) and ps.status!='Cancelled' and ps.schedule_date=curdate()`;

    
    thgconn.query(branchCountQuery, (err, results, fields) => {
        if(err) throw err;
        // if(results[0] != null) {
            branchTotal = setBranchCount(results[0].branch_count);
            console.log(branchTotal);
        // }
        
        // res.send(data);
    });
    
    thgconn.query(branchOccupiedQuery, (err, results, fields) => {
        if(err) throw err;
        branchOcp = setOccupiedCount(results[0].ocp_count);
        console.log(branchOcp);

        var data = {};
        data["branch"] = branch;
        data["total"] = branchTotal;
        data["occupied"] = branchOcp;
        data["vacant"] = branchTotal - branchOcp;
        res.send(data);
    });


    // res.send("Invalid Parameters");
})

function setBranchCount(value) {
    branchTotal = value;
    return branchTotal;
}

function setOccupiedCount(value) {
    branchOcp = value;
    return branchOcp;
}

function getBranchVacant() {
    branchVacant = branchTotal - branchOcp;
    return branchVacant;
}

function setTotalRooms(value) {
    totalRooms = value[0].total;
    console.log(totalRooms);
    return totalRooms;
}

function setOccupiedRooms(value) {
    occupiedRooms = value[0].ocp;
    console.log(occupiedRooms);
    return occupiedRooms;
}

function getVacantRooms() {
    vacantRooms = totalRooms - occupiedRooms;
    console.log(vacantRooms);
    return vacantRooms;
}
function getTotalRooms() {
    return totalRooms;
}
function getOccupiedRooms() {
    return occupiedRooms;
}


app.listen(process.env.PORT || 5000);


