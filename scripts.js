"use strict";
/* globals: $ */

var serverUrl = 'http://localhost:8000';


var Model = function() {
    var self = this;
    self.students = ko.observableArray();
    self.courses = ko.observableArray();

    self.newStudent = {index: ko.observable(), firstName: ko.observable(), lastName: ko.observable(), birthday: ko.observable()};
    self.newCourse = {index: ko.observable(), firstName: ko.observable(), lastName: ko.observable(), birthday: ko.observable()};

    self.path = serverUrl; 


    self.getStudents = function() {

        $.ajax({ 
            type: 'GET', 
            url: `${self.path}/students`, 
            dataType: 'json',
            accept: 'application/json; charset=utf-8',
            success: data => {  
                console.log("data:", data)  

                self.students(data);

                console.log("self.students: ", self.students())           
            }
        });
        
    };

    self.removeStudent = function(student) {

        $.ajax({ 
            type: 'DELETE', 
            url: `${self.path}/students/${student.index}`, 
            dataType: 'json',
            accept: 'application/json; charset=utf-8',
            success: data => {  
                self.getStudents();           
            }
        });
        
    };

    self.editStudent = function(student) {

        $.ajax({ 
            type: 'PUT', 
            url: `${self.path}/students/${student.index}`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            accept: 'application/json; charset=utf-8',
            data: ko.mapping.toJSON(student),
            success: data => {  
                self.getStudents();           
            }
        });
        
    };

    self.addStudent = function() {            
        $.ajax({ 
            type: 'POST', 
            url: `${self.path}/students`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            accept: 'application/json; charset=utf-8',
            data: ko.mapping.toJSON(self.newStudent),
            success: data => {  
                self.getStudents();     
            }
        });
        
    };

    self.getCourses = function() {

        $.ajax({ 
            type: 'GET', 
            url: self.path + "courses", 
            dataType: 'json',
            accept: 'application/json; charset=utf-8',
            success: data => {  
                $.each(data, function(index) {
                    var course = ko.mapping.fromJS(data[index]);
                    self.courses.push(course);
                });
                console.log(self.courses())             
            }
        });
        
    };

};


var view = new Model();

view.getStudents();
view.getCourses();

ko.applyBindings(view);
 
/*
class model {

    studentModel = null;
    courseModel = null;

    getStudents = Type => {
        
        $.ajax({ 
            type: 'GET', 
            url: serverUrl+Type, 
            dataType: 'json',
            accept: 'application/json; charset=utf-8',
            success: data => {  
                console.log(data)           
                this.studentModel = pd.show(data, this.studentModel)
            }
            
        });
    }
    
    getCourses = Type => {    
        
        $.ajax({ 
            type: 'GET', 
            url: serverUrl+Type, 
            dataType: 'json',
            accept: 'application/json; charset=utf-8',
            success: data => {             
                this.courseModel = pd.show(data, this.courseModel)
            }
            
        });
    }
    
} 


class processData {
    show = function(data, model) {

        if(model == null){
            model = ko.mapping.fromJS(data)
        } else { 
            ko.mapping.fromJS(data, model);
        }


        for (var field in model) {
            console.log(field)
            field.subscribe(function(newValue) {
                alert("The person's new name is " + newValue);
            });
        }

        

        console.log(model)
        
        $.each(data, function(index, element) {
            console.log(element)                   
        });

        return model
    
    }
}



var pd = new processData();
var myModel = new model();



console.log(myModel.getStudents("students"))
console.log(myModel.getCourses("courses"))




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
        ko.applyBindings(myModel);
        
    }, 500);
});

*/
