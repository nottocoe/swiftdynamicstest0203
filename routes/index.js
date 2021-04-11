var express = require('express');
var router = express.Router();
var request = require('request');

var min;
var max;
var avg;
var pred;

const url = 'http://3.1.189.234:8091/data/ttntest';

router.get('/value_api', function(req, res, next){
  /*request middleware for fetch all json*/
  request({
    url: url,
    json: true
  }, function(error, response, body) {

  /* function to find min, max, average value and predicted value */
  min = getMin(body);
  max = getMax(body);
  avg = getAvg(body);
  pred = predict(body);
  res.json({min, max, avg, day_prediction: pred, sevenday_prediction: pred*7 });
  })
});

router.get('/data', function(req, res, next) {

  if(req.query.page <= 0){
    res.writeHead(301,
      {Location: '/data?page=1'}
    );
    res.end();
  }
  
  /* variable for pagination */
  const page = req.query.page;
  const limit = 200;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  /*request middleware for fetch all json*/
  request({
    url: url,
    json: true
  }, function(error, response, body) {

    /* function to find min, max, average value and predicted value */
    min = getMin(body);
    max = getMax(body);
    avg = getAvg(body);
    pred = predict(body);

    /* slice data to 200 records */
    const resultData = body.slice(startIndex, endIndex)

    /* page render with sending data */
    res.render('index', { title: 'Swift Dynamics Test', data: resultData, page: page, length: body.length, max: max, min: min, avg: avg, pred: pred });
  });
});

/* find max value function */
function getMax(body) {
  var max;
  for (var i = 0 ; i < body.length ; i++) {
      if (max == null || parseFloat(body[i].data) > parseFloat(max))
          max = body[i].data;
  }

  return max;
}

/* find min value function */
function getMin(body) {
  var min;
  for (var i = 0 ; i < body.length ; i++) {
      if (min == null || parseFloat(body[i].data) < parseFloat(min))
          min = body[i].data;
  }

  return min;
}

/* find average value function */
function getAvg(body) {
  var sum = 0;
  var avg = 0;
  for (var i = 0 ; i < body.length ; i++) {
    sum += parseFloat(body[i].data);
  }
  avg = sum / body.length;

  return avg.toFixed(2);
}

function predict(body){
  var day = []; //Date List
  var day_count = 0;
  var valueAmount = []; //Amount of Value in each day

  /* Push date of first record*/
  day.push(body[0].timestamp.substr(0,10));

  /*Loop for push date to array*/
  for( var i = 0; i < body.length; i++ ){
    if( day[day_count] !== body[i].timestamp.substr(0,10) ){
      day.push(body[i].timestamp.substr(0,10));
      day_count++;
    }
  }

  /*remove duplicate date value in day array*/
  const uniqueSet = new Set(day);
  const countDay = [...uniqueSet];

  /*push first array value*/
  valueAmount.push(0);

  /* loop to find amount of data per day in array*/
  for(var i = 0; i < countDay.length; i++){
    for(var j = 0; j < body.length; j++){
      if(countDay[i] === body[j].timestamp.substr(0,10)){
        valueAmount[i] += 1;
      }
    }
    valueAmount.push(0);
  }

  /* pop last value because it's equal zero*/
  valueAmount.pop();

  var average = valueAmount.reduce(function(valueAmount, b) { return valueAmount + b; }, 0) / valueAmount.length;

  return parseInt(average);
  
}

module.exports = router;
