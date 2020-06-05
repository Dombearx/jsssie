"use strict";
/* globals: $ */

var serverUrl = 'http://localhost:8000/';

var model = function() {

    var pd = new processData();

    var studentModel = Object.create(ko.observableArray);
    var courseModel = Object.create(ko.observableArray);


    this.getStudents = Type => {
        
        $.ajax({ 
            type: 'GET', 
            url: serverUrl+Type, 
            dataType: 'json',
            accept: 'application/json; charset=utf-8',
            success: function (data) {  
                console.log(data)           
                pd.show(data, studentModel)
            }
            
        });
    }
    
    this.getCourses = Type => {    
        
        $.ajax({ 
            type: 'GET', 
            url: serverUrl+Type, 
            dataType: 'json',
            accept: 'application/json; charset=utf-8',
            success: function (data) {             
                pd.show(data, courseModel)
            }
            
        });
    }
    
} 


var processData = function(){
    this.show = function(data, model) {

        model = ko.mapping.fromJS(data)

        //ko.mapping.fromJS(data, model);

        console.log(model)
        
        $.each(data, function(index, element) {
            console.log(element)                   
        });
    
    }
}


var model = new model();

console.log(model.getStudents("students"))
console.log(model.getCourses("courses"))


window.onload = function() {
 
    alert( "welcome" );
     
};

$(function () {
    if (!Modernizr.inputtypes.date) {
        console.log("The 'date' input type is not supported, so using JQueryUI datepicker instead.");
        $(".theDate").datepicker();
    }
});

$(function () {
    setTimeout(function() {
        console.log("binding")
        console.log(model);
        ko.applyBindings(model);
    }, 500);
});

