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

    var gradeSubscription = null;

    self.newStudent = {index: ko.observable(), firstName: ko.observable(), lastName: ko.observable(), birthday: ko.observable(), draftId: self.globalDraftId++};
    self.newCourse = {id: ko.observable(), name: ko.observable(), lecturer: ko.observable(), draftId: self.globalDraftId++};
    self.newGrade = {id: ko.observable(), value: ko.observable(), course: ko.observable(), date: ko.observable(), draftId: self.globalDraftId++};

    

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
                console.log("edited succesfully")           
            },
            complete: data => {
                console.log("editing complete", data)
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
            if(object.status == "added" && object.value.hasOwnProperty('draftId')){
                console.log("course status added: ", object)
                var course = object.value
                var newCourseDraftId = course.draftId

                var copiedCourse = self.removeDraftId(course)

                $.ajax({ 
                    type: 'POST', 
                    url: `${self.path}/courses`, 
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    accept: 'application/json; charset=utf-8',
                    data: ko.mapping.toJSON(copiedCourse),
                    success: data => {  
                        console.log("added succesfully") 
                        self.courses().forEach(course => {
                            if(course.draftId == newCourseDraftId){
                                self.courses.remove(course)
                            }
                        })

                        var course = ko.mapping.fromJS(data)

                        course = self.subscribeCourse(course);
                        self.courses.push(course)          
                    },
                    complete: data => {
                        console.log("adding complete", data)
                    }
                });
            }

            if(object.status == "deleted" && !object.value.hasOwnProperty('draftId')){
                var course = object.value
                console.log("removing course", course)
                console.log(`${self.path}/students/${course.id()}`)
                $.ajax({ 
                    type: 'DELETE', 
                    url: `${self.path}/courses/${course.id()}`, 
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

    self.editCourse  = (id) => (wartoscPola) => {

        var courseToPut = self.courses().find(x => x.id() === id)

        $.ajax({ 
            type: 'PUT', 
            url: `${self.path}/courses/${courseToPut.id()}`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            accept: 'application/json; charset=utf-8',
            data: ko.mapping.toJSON(courseToPut),
            success: data => {  
                console.log("edited succesfully")           
            },
            complete: data => {
                console.log("editing complete", data)
            }
        });
        
    };

    self.subscribeCourse = function(course){
        course.id.subscribe(self.editCourse(course.id()))
        course.name.subscribe(self.editCourse(course.id()))
        course.lecturer.subscribe(self.editCourse(course.id()))

        return course
    }

    self.getCourses = function() {

        $.ajax({ 
            type: 'GET', 
            url: `${self.path}/courses`, 
            dataType: 'json',
            accept: 'application/json; charset=utf-8',
            success: data => {  

                data.forEach(x => {
                    var course = ko.mapping.fromJS(x)
                    course = self.subscribeCourse(course);

                    self.courses.push(course)
                })

                self.courses.subscribe(self.manageCourses, null, 'arrayChange');
                console.log(self.courses())            
            }
        });
        
    };

    self.removeCourse = function(course) {
        self.courses.remove(course);  
        
    };

    self.addCourse = function() {   
        self.courses.push({ ...self.newCourse });

        self.newCourse.id("")
        self.newCourse.name("")
        self.newCourse.lecturer("")
        self.newCourse.draftId(self.globalDraftId++)
    };


    self.manageGrades = (objects => {
        objects.forEach(object => {
            if(object.status == "added" && object.value.hasOwnProperty('draftId')){
                console.log("grade status added: ", object)

                var grade = object.value
                var courseId = grade.course.id;                
                var newGradeDraftId = grade.draftId

                grade.course = self.courses().find(x => x.id() === courseId)

                var copiedGrade = self.removeDraftId(grade)


                $.ajax({ 
                    type: 'POST', 
                    url: `${self.path}/students/${self.currentStudentId()}/grades`, 
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    accept: 'application/json; charset=utf-8',
                    data: ko.mapping.toJSON(copiedGrade),
                    success: data => {  
                        
                        self.grades().forEach(grade => {
                            if(grade.draftId == newGradeDraftId){
                                self.grades.remove(grade)
                            }
                        })

                        var grade = ko.mapping.fromJS(data)

                        grade = self.subscribeGrade(grade);
                        self.grades.push(grade)
                        console.log("new grade id: ", grade.id())
                    },
                    complete: data => {
                        console.log("complete", data)
                    }
                });                   
            }

            if(object.status == "deleted" && !object.value.hasOwnProperty('draftId')){
                var grade = object.value
                console.log("removing garde", grade)
                console.log(`${self.path}/students/${self.currentStudentId()}/grades/${grade.id()}`)
                $.ajax({ 
                    type: 'DELETE', 
                    url: `${self.path}/students/${self.currentStudentId()}/grades/${grade.id()}`, 
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


    self.subscribeGrade = function(grade){
        grade.value.subscribe(self.editGrade(grade.id()))
        grade.course.id.subscribe(self.editGrade(grade.id()))
        grade.date.subscribe(self.editGrade(grade.id()))

        return grade
    }

    

    self.getGrades = function(student) {
        console.log("get grades")

        self.currentStudent(student.firstName() + " " + student.lastName());
        self.currentStudentId(student.index());

        if(gradeSubscription != null){
            gradeSubscription.dispose();
        }
         
        self.grades([]);
        gradeSubscription = self.grades.subscribe(self.manageGrades, null, 'arrayChange');

        console.log(`${self.path}/students/${student.index()}/grades`)

        $.ajax({ 
            type: 'GET', 
            url: `${self.path}/students/${student.index()}/grades`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            accept: 'application/json; charset=utf-8',
            success: data => {  
                

                console.log("Adding grade to list")
                data.forEach(x => {
                    var grade = ko.mapping.fromJS(x)
                    grade = self.subscribeGrade(grade);

                    self.grades.push(grade)
                })
                console.log(self.grades())
            }
        });
        return true;
    };

    self.addGrade = function() {
        if(self.newGrade.value() === "2.5"){
            console.log("grade returning")
            return
        }
        console.log("adding grade")
        self.grades.push({ ...self.newGrade });

        self.newGrade.id("")
        self.newGrade.value("")
        self.newGrade.course(self.courses()[0].id)
        self.newGrade.date(new Date())
    };

    self.removeGrade = function(grade) {
        self.grades.remove(grade); 
    };


    self.editGrade  = (id) => (wartoscPola) => {

        var gradeToPut = self.grades().find(x => x.id() === id)

        $.ajax({ 
            type: 'PUT', 
            url: `${self.path}/students/${self.currentStudentId()}/grades/${id}`, 
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: ko.mapping.toJSON(gradeToPut),
            success: data => {  
                console.log("edited succesfully")           
            },
            complete: data => {
                console.log("editing complete", data)
            }
        });
        
    };        
    

};


var view = new Model();

view.getStudents();
view.getCourses();

ko.applyBindings(view);
