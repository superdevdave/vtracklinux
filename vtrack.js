const si = require('systeminformation');
const fs = require('fs');
const jsonfile = require('jsonfile');
const win32Software = require('fetch-installed-software');
const darwinSystemProfiler = require('apple-system-profiler');
const darwinInetDecoder = require('apple-inet-decoder');
const linux_apps = require('linux-app-list')();
const hexToDec = require('hex-to-dec');
const amqplib = require('amqplib/callback_api');
const Ping = require('ping-lite');
const http = require('http');
const Blowfish = require('blowfish-security-lib');
const secretKey = 'LTP69DyhTZ3CpdJDUgyFpqa3xdvD8cyVfbqvhyGMpG5gcXarBRVDyRBdR4dF6uvQU4zbReCjTTzHL7mte5c4f32TbaL7e3G8KeTLPZxLAqVtU9XWaEfRz2Fm';
//const win32DigitalKeys = require('fetch-digital-keys');
const thenetmask=require('my-local-netmask')();
const meminfo =require('free-memory');
var childProcess = require('child_process');
var serialNumber=require('serial-number');
const setTimeout=require('safe-timers').setTimeout;
const uuidv4 = require('uuid/v4');

var vtrackConfig = {};


async function processCheckIn() {
global.totalmemory=0;


var machine = await si.getStaticData();
machine.version = "2.0.0";
machine.createdDate = new Date();
machine.users = await si.users();
machine.Drives = await si.fsSize();
machine.processes = await si.processes();
machine.motherboard=await si.baseboard();
//machine.graphics=await si.graphics();
machine.graphics=null;
machine.remove

 var serial = machine.serial;



if (process.platform === 'linux') {

 
//Optimise for VirtualBox/VMWARE blank serials

if (typeof machine.serial==="undefined"||machine.serial==="-")
{


machine.serial=machine.system.uuid;
machine.system.serial=machine.system.uuid;

if (typeof machine.system.uuid==="undefined"||machine.system.serial==="-"||machine.system.serial==="")
{
machine.serial="UUID-"+generateHashCode(machine.os.hostname);
machine.system.serial="UUID-"+generateHashCode(machine.os.hostname);
}
}

if (machine.baseboard.serial.length>2)
{
var str=machine.baseboard.serial;

if (str.includes("/"))
{
var res=str.split("/");
str=res[1];
}

machine.serial=str;
machine.system.serial=str;
}

try{

//For missing netmask from si system information
for (var xj = 0; xj <machine.net.length; xj++) {
if (typeof machine.net[xj].netmask==="undefined"||machine.net[xj].netmask==="")
{

machine.net[xj].netmask=thenetmask;

}
//Because localhost is in Class A and Class A subnets are usually always /8 255.0.0.0 unless specified
if (machine.net[xj].ip4==="127.0.0.1")
{
machine.net[xj].netmask="255.0.0.0";
}
}

/*
//Handle Unknown Physical Disk Details in  Linux/Virtual Machines
      for (var pj = 0; pj < machine.diskLayout.length; pj++) {
if (typeof machine.diskLayout[pj]==="undefined"||machine.diskLayout[pj].serialNum==="")
{
var newsto=new Array();

newsto.diskLayout[pj].name="Unkonwn";
newsto.diskLayout[pj].serialNum="Unkonwn";
newsto.diskLayout[pj].size="0";
}
machine.diskLayout.push(newsto.diskLayout[pj]);
}

*/
//machine.logicalDrives1=new Array();
//Handle Unknown Logical Disk Details in  Linux/Virtual Machines

      for (var lj = 0; lj < machine.logicalDrives.length; lj++) {

if (machine.logicalDrives[lj].mount.length>6)
{

machine.logicalDrives[lj].mount=machine.logicalDrives[lj].mount.substring(0,6);
}

if (typeof machine.logicalDrives[lj]==="undefined"||machine,logicalDrives[lj].type==="")
{
var newlogical=new Array();

newlogical.logicalDrives[lj].mount="Unkonwn";
newlogical.logicalDrives[lj].type="Unkonwn";
newlogical.logicalDrives[lj].size="0";
newlogical.logicalDrives[lj].used="0";

machine.logicalDrives.push(newlogical.logicalDrives[lj]);
}


}


/*/For missing Graphics adapter on Linux/Virtual Machines
  for(var g=0;g<machine.graphics.controllers.length;g++)
{
if (typeof machine.graphics.controllers.model==="undefined")
{
machine.graphics.controllers[g].model="Unknown";
machine.graphics.controllers[g].description="Unknown";
machine.graphics.controllers[g].manufacturer="Unknown";
machine.graphics.controllers[g].name="Unknown";

console.log(g);
}
if (typeof machine.graphics.controllers[g].vram==="undefined"||machine.graphics.controllers[g].vram==="");
{
machine.graphics.controllers[g].vram="0";

}
}
*/


}
catch(e)
{
console.log(e);
}

try
{

if(linux_apps == undefined){
    console.error("Failed to load apps module.");
    return;
}

var software= new Array();

await linux_apps.list().forEach(function(app){

    var data = linux_apps.data(app);
    if(data == undefined){
       // console.log("    " + app + " - Unable to get info");
    }else{
       // console.log("    " + app);
      //  console.log(data);
	software.push(data);
    }
});

var Drives=new Array();
Drives=await si.fsSize();


machine.software=software.map(restructureLinuxSoftware).filter(item => item.DisplayName !== undefined);
machine.logicalDrives=Drives.map(restructureLogicalDrives).filter(item=>item.fs!==undefined);


///FINALLY GET THE TOTAL RAM FIRST THEN PUBLISH  THE MACHINE
for (var rm = 0; rm <meminfo.length; rm++) {

meminfo(function (err, info) {

if (typeof machine.memLayout==="undefined"||machine.memLayout===" "||machine.memLayout.length===0)
{
var newmem=new Object();
newmem.name="Unknown";
newmem.type="Unknown";
newmem.manufacturer="Unknown";
newmem.bank="Unknown";
newmem.partNum="Unknown";
newmem.serialNum="Unknown";
newmem.size=info.mem.total/1024;
newmem.clockSpeed="Unknown";

machine.memLayout.push(newmem);


}

///console.dir(machine.memLayout);

///Fix Memory Layout in Linux/Ubuntu/VBox
for (var i = 0;i<machine.memLayout.length; i++) {



if (typeof machine.memLayout[i].serialNum==="undefined"||machine.memLayout[i].serialNum.length===0||machine.memLayout[i].serialNum.length==="")
{

machine.memLayout[i].serialNum="Unknown";
machine.memLayout[i].partNum="Unknown";
machine.memLayout[i].size="0";
machine.memLayout[i].bank="Unknown";
machine.memLayout[i].manufacturer="Unknown";
machine.memLayout[i].clockspeed=0;
//machine.memLayout.splice(i,1,{manufacturer:"Unknown",serialNum:"Unknown",partNum:"Unknown",size:0,bank:"Unknown",clockspeed:0});

}
}


/*//Fix Missing Graphics in Linux/Ubuntu/VBox
if (typeof machine.graphics.controllers.model==="undefined")
{


machine.graphics.controllers.splice(0,1,{model:"Unknown",vram:machine.graphics.controllers[0].vram});

}
*/
console.log(machine);
startPublishProcess(machine);
});

}
}
catch(e)
{
console.log(e)
}



console.log(machine.memLayout);

  }
  else if (process.platform === 'win32') {
    var software = await win32Software.getAllInstalledSoftware();
    machine.software = software.map(restructureWin32Software).filter(item => item.DisplayName !== undefined);
    //machine.digitalKeys = await win32DigitalKeys.getAllDigitalKeys();
    startPublishProcess(machine);
  } 






else if (process.platform === 'darwin') {
    //console.log(machine.net.map((currentValue) => currentValue.iface));
    await darwinInetDecoder({
      interfaces: machine.net.map((currentValue) => currentValue.iface)
    }, (err, out) => {
      if (err) throw err;
      //console.log(out);

      for (var j = 0; j < machine.net.length; j++) {
        for (var i = 0; i < out.length; i++) {
          if (machine.net[j].iface === out[i].iface) {
            machine.net[j].netmask = out[i].netmask;
            break;
          }
        }
      }
    });

    darwinSystemProfiler({
      dataTypes: ['SPApplicationsDataType']
    }, (err, out) => {
      if (err) throw err;

      //console.log(out[0].items);
      try {
        machine.software = out[0].items.map(restructureDarwinSoftware);
      } catch (e) {

      }

      darwinSystemProfiler({
        dataTypes: ['SPPrintersDataType']
      }, (err, out) => {
        if (err) throw err;

        try {
          machine.printers = out[0].items.map(restructureDarwinPrinters);
        } catch (e) {

        }

        //console.log(machine.printers);

     startPublishProcess(machine);
      });
    });
  }

  jsonfile.writeFile('machine.json', machine, (err) => {
    if (err) throw err;
  });
  //console.log('processing checkin for device with serial "' + machine.system.serial + '"');

checkInTimeout = setTimeout(function() {
   processMessageQueue();
    processCheckIn();
  }, vtrackConfig.CheckInInterval * 60 * 1000);



}

function generateHashCode(text)
{
    // assuming text is UTF-8 encoded

    var crypto = require('crypto');
    var hexDigest = crypto.createHash('SHA1').update(text).digest(); // this should be .digest() not .digest('hex')

    var hexStr = "";
    for (var i = 0; i < hexDigest.length; i++) {
        hexStr += (((hexDigest[i] - 0x100) & 0xff) + 0x100).toString(16).substr(1); // fixed some math issues here
    }

    var hashid = 0;
    var a = 'a'.charCodeAt(0); // or just var a = 97;
    for (var i = 0; i < hexStr.length; i++)
        hashid += Math.abs(Math.pow(27, 10 - i) * (a - (1 + hexStr.charCodeAt(i))));

    return hashid;
}

function startPublishProcess(machine) {
  var ping = new Ping(vtrackConfig.NetworkServer);

  ping.send(function(err, ms) {
    //console.log(this._host + ' responded in ' + ms + ' ms');

    if (!err && ms !== null) {
      // Can ping network server

      console.log('network check-in');
      publishNetworkCheckIn(machine);
    } else {
      // Need to check in over the internet
      console.log('Server is not available will try again on next check in ');
     // console.log('internet check-in');
     // publishInternetCheckIn(machine);
    }
  });
}

function restructureWin32Software(item) {
  return {
    "DisplayVersion": item.DisplayVersion,
    "InstallDate": item.InstallDate,
    "Publisher": item.Publisher,
    "EstimatedSize": hexToDec(item.sEstimatedSize2),
    "DisplayName": item.DisplayName,
  };
}

function restructureDarwinSoftware(item) {
  return {
    "DisplayVersion": item.version,
    "InstallDate": null,
    "Publisher": item.info,
    "EstimatedSize": 0,
    "DisplayName": item._name,
  };
}

function restructureLogicalDrives(item){
return{
"fs":item.fs,
"used":item.used,
"mount":item.mount.substring(0,6),
"size":item.size,
"type":item.type
}

}



function restructureLinuxSoftware(item) {
    return {
        "DisplayVersion": item.version,
        "InstallDate": item.InstallDate,
        "Publisher":item.info,
        "EstimatedSize":item.size,
        "DisplayName": item.Name,
    };
}


function restructureDarwinPrinters(item) {
  return {
    "PrinterName": item._name,
    "PrinterPort": item.uri
  };
}

async function processMessageQueue() {
  var system = await si.system();
  var serial = system.serial;
/*

//Optimise for VirtualBox blank serials
if (typeof serial==="undefined")
{
serial="Null";

}

if(serial==="-"){
serial="Null";
}

if(serial.length===0){
serial="Null";
}*/





  var queue = vtrackConfig.Company + '.client.' + serial;
  var open = amqplib.connect('amqps://innovent:42ZkvjVFfeknsWjp1ud3Z0XmOyC8e3QN@129.232.222.130/innovent', {rejectUnauthorized: false}, function(err, conn) {
    if (err === null) {
      conn.createChannel(function (err, ch) {
        if (err === null) {
          ch.assertQueue(queue, {durable: true}, function(err, ok) {
            if (err === null) {
              ch.consume(queue, function (msg) {
                if (msg !== undefined && msg !== null) {
                  //ch.ack(msg);
                }
              }, {noAck: true}, function (err, ok) {
                ch.close();
                conn.close();
              });
            }
          });
        }
      });
    }
  });
}

function publishInternetCheckIn(machine) {


  var routingKey = vtrackConfig.Company + '.server.message';
  var open = amqplib.connect('amqps://innovent:42ZkvjVFfeknsWjp1ud3Z0XmOyC8e3QN@129.232.222.130/innovent', {rejectUnauthorized: false}, function(err, conn) {
    if (err === null) {
      //console.log('creating channel');
      conn.createChannel(function (err, ch) {
        if (err === null) {
          //console.log('asserting exchange');
          ch.assertExchange('amq.topic', 'topic', {durable: true}, function(err, ok) {
            if (err === null) {
              var options = {
                replyTo: vtrackConfig.Company + '.client.' + machine.system.serial,
                type: 'MCIJSON'
              };
              //console.log('publishing message');
              ch.publish('amq.topic', routingKey,  Buffer.alloc(JSON.stringify(machine).size), options, function(err, ok) {
                //console.log('done checking in');
                ch.close();
                conn.close();
                vtrackConfig.LastCheckIn = new Date();
                saveConfig();
              });
            } else {
              //console.log('2');
              //throw err;
            }
          });
        } else {
          //console.log('1');
          //throw err;
        }
      });
    }
  });
}

function publishNetworkCheckIn(machine) {


  var postData = JSON.stringify(machine);

  //console.log("'" + JSON.stringify(machine) + "'");

  var options = {
    hostname: vtrackConfig.NetworkHost,
    port: vtrackConfig.NetworkPort,
    path: vtrackConfig.NetworkPath,
    method: "POST",
  	"data": JSON.stringify(machine),
  	"headers": {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    }
  };

  var req = http.request(options, (res) => {
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.header));
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      vtrackConfig.LastCheckIn = new Date();
      saveConfig();
      //console.log('No more data in response.');
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  // write data to request body
  req.write(postData);
  req.end();
}



function loadConfig() {
  return JSON.parse(fs.readFileSync('./vtrack.config').toString());
}

function saveConfig() {
  var ws = fs.createWriteStream('./vtrack.config');
  ws.write(JSON.stringify(vtrackConfig));
  ws.end();
}

function start() {
  vtrackConfig = loadConfig();
  processMessageQueue();
  processCheckIn();
}

start();


