
const socket = io();
socket.on("connect", () => { console.log('Connected to SocketIO')});
var exportData = []
var xValues = [...Array(200).keys()]
let btn = document.getElementById('btnCount');
btn.addEventListener('click', () => {
    chart.data.labels = xValues = [...Array(200).keys()]
    interValTime = 1000
    location.reload();
    clearInterval(interval);
    exportData = []
    interval = setInterval(()=>{createArray()}, interValTime);
});


var data1 = [] ; 
// var data2 = Array.from({length: 20}, () => Math.floor(Math.random() * 400)) ; 
// var data3 = Array.from({length: 20}, () => Math.floor(Math.random() * 400)) ;

socket.on("data", (msg) => {
  // console.log('data comming', msg.toString().slice(1,-1).split(','))
  let arrayData = msg.toString().split(',')
  exportData = exportData.concat(arrayData)
  data1 = data1.concat(arrayData)  
  console.log(msg.toString() )
});
var interValTime = 1000

const ctx = document.getElementById('myChart');


function saveCSV () {
  // (A) ARRAY OF DATA
  var array = exportData 
  // console.log(array ,' array')
  // (B) CREATE BLOB OBJECT
  var blob = new Blob([(array)], {type: "text/csv"});
 
  // (C) CREATE DOWNLOAD LINK
  var url = window.URL.createObjectURL(blob);
  var anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "export.csv";
 
  // (D) "FORCE DOWNLOAD"
  // NOTE: MAY NOT ALWAYS WORK DUE TO BROWSER SECURITY
  // BETTER TO LET USERS CLICK ON THEIR OWN
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
  exportData = []
}

var chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xValues,
      datasets: [{ 
        label: 'Data',
        data: data1,
        borderColor: "red",
        fill: false
      }]
    },
    options: {
      legend: {display: false},
      animation: {
        duration: 0
    }
    }
  })


function createArray(){
    if(data1.length >= 200){
        data1 = data1.splice(20,200)
        // console.log(data1)
    }

    let dataUpdate  =[ {
            label: 'S',
            borderColor : "red",
            data :data1,
            fill : false
        }
        ]
    // console.log(chart.data.labels)
    chart.data.datasets = dataUpdate    
    // console.log(chart.data.datasets)
    chart.update()
    // chart.update();
}

var interval = setInterval(()=>{
    createArray()
 
},interValTime)

