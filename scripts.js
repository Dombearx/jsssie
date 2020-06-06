"use strict";
/* globals: $ */

var serverUrl = 'http://localhost:8000';


var Model = function() {
    var self = this;
    self.students = ko.observableArray();
    self.courses = ko.observableArray();

    self.grades = ko.observableArray();
    self.currentStudent = ko.observable("");
    self.currentStudentId = ko.observable();

    self.globalDraftId = 1;

    self.newStudent = {index: ko.observable(), firstName: ko.observable(), lastName: ko.observable(), birthday: ko.observable(), draftId: self.globalDraftId++};
    self.newCourse = {id: ko.observable(), name: ko.observable(), lecturer: ko.observable()};
    self.newGrade = {id: ko.observable(), value: ko.observable(), course: ko.observable(), date: ko.observable()};

    self.path = serverUrl; 


    self.removeDraftId = function(object){

        var copied = {... object}
        delete copied.draftId

        return copied

    }

    // STUDENTS
    self.manageStudents = (objects => {
        objects.forEach(object => {
            if(object.status == "added" && object.value.hasOwnProperty('draftId')){
                console.log("Student status added: ", object)
                var student = object.value
                var newStudentDraftId = student.draftId

                var copiedStudent = self.removeDraftId(student)

                $.ajax({ 
                    type: 'POST', 
                    url: `${self.path}/students`, 
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    accept: 'application/json; charset=utf-8',
                    data: ko.mapping.toJSON(copiedStudent),
                    success: data => {  
                        console.log("added succesfully")  
                        self.students().forEach(student => {
                            console.log("forEach", student)
                            console.log("draftIds", student.draftId, newStudentDraftId)
                            if(student.draftId == newStudentDraftId){
                                console.log("removing studnet", student)
                                self.students.remove(student)
                            }
                        })
                        console.log(data)

                        var student = ko.mapping.fromJS(data)

                        student = self.subscribeStudent(student);
                        self.students.push(student)
        
                    },
                    complete: data => {
                        console.log("adding complete", data)
                    }
                });
            }

            if(object.status == "deleted" && !object.value.hasOwnProperty('draftId')){
                var student = object.value
                console.log("removing student", student)
                console.log(`${self.path}/students/${student.index()}`)
                $.ajax({ 
                    type: 'DELETE', 
                    url: `${self.path}/students/${student.index()}`, 
                    dataType: 'json',
                    accept: 'application/json; charset=utf-8',
                    success: data => {  
                        console.log("deleted succesfully")           
                    },
                    complete: data => {
                        console.log("deleting complete", data)
                    }
                });
            }
        })
    });

    self.editStudent = (index) => (wartoscPola) => {
        console.log("edited:", wartoscPola)

        console.log(self.students())

        var studentToPut = self.students().find(x => x.index() === index)

            
        $.ajax({ 
            type: 'PUT', 
            url: `${self.path}/students/${studentToPut.index()}`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            accept: 'application/json; charset=utf-8',
            data: ko.mapping.toJSON(studentToPut),
            success: data => {  
                console.log("deleted succesfully")           
            },
            complete: data => {
                console.log("deleting complete", data)
            }
        });
    }

    self.subscribeStudent = function(student){
        student.firstName.subscribe(self.editStudent(student.index()))
        student.lastName.subscribe(self.editStudent(student.index()))
        student.birthday.subscribe(self.editStudent(student.index()))

        return student
    }

    self.getStudents = function() {

        $.ajax({ 
            type: 'GET', 
            url: `${self.path}/students`, 
            dataType: 'json',
            accept: 'application/json; charset=utf-8',
            success: data => {  
                console.log("data:", data) 

                data.forEach(x => {
                    var student = ko.mapping.fromJS(x)
                    student = self.subscribeStudent(student);

                    self.students.push(student)
                })

                

                //self.students(data);
                // console.log("self.students: ", self.students())

                // self.students().forEach(student => {
                //     console.log("foreach:", student)
                //     student.subscribe(self.studetPut)
                // })

                // ko.utils.arrayForEach(self.students, function(student) {
                //     console.log("foreach:", student)
                //     student.subscribe(self.studetPut)
                // });

                self.students.subscribe(self.manageStudents, null, 'arrayChange');
            }
        });
    };

    self.removeStudent = function(student) {
        self.students.remove(student);
    };

    self.addStudent = function() {           
        self.students.push({ ...self.newStudent });

        self.newStudent.index("")
        self.newStudent.firstName("")
        self.newStudent.lastName("")
        self.newStudent.birthday(new Date())
        self.newStudent.draftId(self.globalDraftId++)

    };
    
    // COURSES
    self.manageCourses = (objects => {
        objects.forEach(object => {
            if(object.status == "added"){
                console.log("course status added: ", object)
                var course = object.value
                $.ajax({ 
                    type: 'POST', 
                    url: `${self.path}/courses`, 
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    accept: 'application/json; charset=utf-8',
                    data: ko.mapping.toJSON(course),
                    success: data => {  
                        console.log("added succesfully")           
                    },
                    complete: data => {
                        console.log("adding complete", data)
                    }
                });
            }

            if(object.status == "deleted"){
                var course = object.value
                console.log("removing course", course)
                console.log(`${self.path}/students/${course.id}`)
                $.ajax({ 
                    type: 'DELETE', 
                    url: `${self.path}/courses/${course.id}`, 
                    dataType: 'json',
                    accept: 'application/json; charset=utf-8',
                    success: data => {  
                        console.log("deleted succesfully")           
                    },
                    complete: data => {
                        console.log("deleting complete", data)
                    }
                });
            }
        })
    });


    self.getCourses = function() {

        $.ajax({ 
            type: 'GET', 
            url: `${self.path}/courses`, 
            dataType: 'json',
            accept: 'application/json; charset=utf-8',
            success: data => {  
                self.courses(data); 
                self.courses.subscribe(self.manageCourses, null, 'arrayChange');
                console.log(self.courses())            
            }
        });
        
    };

    self.addCourse = function() {   
        self.courses.push(self.newCourse);

    };

    self.removeCourse = function(course) {
        self.courses.remove(course);  
        
    };

    // self.students.subscribe(newValue => {
    //     console.log("newValue:", newValue);
    //     console.log("students: ", self.students());
    // }, null, "beforeChange");

   

    self.getGrades = function(student) {
        console.log("get grades")
        self.currentStudent(student.firstName + " " + student.lastName);
        self.currentStudentId(student.index);
        $.ajax({ 
            type: 'GET', 
            url: `${self.path}/students/${student.index}/grades`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            accept: 'application/json; charset=utf-8',
            data: ko.mapping.toJSON(student),
            success: data => {  
                self.grades(data);      
                console.log("data", data)
                console.log("grades", self.grades())    
            }
        });
        return true;
        
    };

    self.getGradesByIndex = function(studentIndex) {
        console.log("get grades by index")
        self.newGrade.course = ko.observable(self.courses[0]);

        ko.utils.arrayForEach(self.students(), function(student) {
            if(student.index == studentIndex){
                self.currentStudent(student.firstName + " " + student.lastName);
                self.currentStudentId(student.index);
                
            }
        });  

        $.ajax({ 
            type: 'GET', 
            url: `${self.path}/students/${studentIndex}/grades`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            accept: 'application/json; charset=utf-8',
            success: data => {  
                self.grades(data);      
                console.log("data", data)
                console.log("grades", self.grades())    
            }
        });
        return true;
        
    };

    

    self.addGrade = function() {
        console.log("add grades")
        var courseName = self.newGrade.course();

        console.log("student", self.currentStudentId());
        console.log("course", self.newGrade);
        console.log("url", `${self.path}/students/${self.currentStudentId()}/grades`);
        $.ajax({ 
            type: 'POST', 
            url: `${self.path}/students/${self.currentStudentId()}/grades`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            accept: 'application/json; charset=utf-8',
            data: ko.mapping.toJSON(self.newGrade),
            success: data => {  
                self.getGradesByIndex(self.currentStudentId());       
            },
            complete: data => {
                console.log("fail", data)
            }
        });        
    };


    self.editGrade = function(grade) {
        console.log("grade", grade)

        console.log(`${self.path}/students/${self.currentStudentId()}/grades/${grade.id}`)
        $.ajax({ 
            type: 'PUT', 
            url: `${self.path}/students/${self.currentStudentId()}/grades/${grade.id}`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: ko.mapping.toJSON(grade),
            success: data => {  
                console.log("succ", data)
                self.getGradesByIndex(self.currentStudentId());           
            },
            complete: data => {
                console.log("fail", data)
            }
        });
        
    };

    

    

   

    self.editCourse = function(course) {

        $.ajax({ 
            type: 'PUT', 
            url: `${self.path}/courses/${course.id}`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            accept: 'application/json; charset=utf-8',
            data: ko.mapping.toJSON(course),
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
