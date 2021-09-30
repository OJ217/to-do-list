//jshint esversion:6

exports.getDate = function(){
    let currentDay = new Date();

    let options = { 
        year: "numeric", 
        month: "long",
        day: "numeric"};
        
    return currentDay.toLocaleDateString("en-US", options);
}

exports.getDay = function(){
    let currentDay = new Date();

    let options = { 
        weekday: "long"
    }

    return currentDay.toLocaleDateString("en-US", options);
}