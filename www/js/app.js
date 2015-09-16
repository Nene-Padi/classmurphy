var classMurphy = angular.module('app', ['ionic']);

classMurphy.factory('Semesters', function(){
  return{
    all : function(){
      var semString = window.localStorage['semesters'];
      if(semString){
        return angular.fromJson(semString);
      }
      return [];
    },

    save: function(semesters){
      window.localStorage['semesters'] = angular.toJson(semesters);
    },

    newSemester: function(semName){
      return {
        name: semName,
        courses: []
      };
    },

    getLastActiveIndex: function(){
      return parseInt(window.localStorage['lastActiveSem']) || 0;
    },

    setLastActiveIndex: function(index){
      window.localStorage['lastActiveSem'] = index;
    }
  }
});

classMurphy.controller('courseCtrl', function($scope, $timeout, $ionicModal, Semesters, $ionicSideMenuDelegate){
  var createSemester = function(semName){
    var newSemester = Semesters.newSemester(semName);
    $scope.semesters.push(newSemester);
    Semesters.save($scope.semesters);
    $scope.selectSem(newSemester, $scope.semesters.length - 1);
  }

  $scope.semesters = Semesters.all();

  $scope.activeSemester = $scope.semesters[Semesters.getLastActiveIndex()];

  $scope.newSemester = function(){
    var semName = document.getElementById('semp').value;
    if(semName){
      createSemester(semName);
    }
    semester.name = '';
  };

  var gradeEquiv = function(grade){
    var equivalence;
    switch(grade){
      case "A":
        equivalence = 4.0;
        break;
      case "B+":
        equivalence = 3.5;
        break;
      case "B":
        equivalence = 3.0;
        break;
      case "C+":
        equivalence = 2.5;
        break;
      case "C":
        equivalence = 2.0;
        break;
      case "D+":
        equivalence = 1.5;
        break;
      case "D":
        equivalence = 1.0;
        break;
      default:
        equivalence = 0.0;
        break;
    }

    return equivalence;
  }

  var cgpa = function(){
    var json_object = JSON.parse(localStorage["semesters"]);
    var equiv;
    var gpaProduct;
    var per_sem_gpaProduct = 0.0;
    var per_sem_creditHours = 0;
    var cgpa = 0.0;


    for (var i = 0; i < json_object.length; i++) {
      var theCourses = json_object[i].courses;
      //console.log(theCourses);
      for (var j = 0; j < theCourses.length; j++) {
        var grade = theCourses[j].grade;
        var creditHours = theCourses[j].credit;
        equiv = gradeEquiv(grade);

        gpaProduct = equiv * creditHours;
        per_sem_gpaProduct += gpaProduct;
        per_sem_creditHours += creditHours;
        
      };
    };
    cgpa = per_sem_gpaProduct / per_sem_creditHours;
    document.getElementById("cgpa").innerHTML = cgpa;
  }

  var gpa = function(){
    var myCourses = $scope.activeSemester.courses;
    var pEquiv;
    var pGradeProduct;
    var pTotalHours = 0;
    var pTotalGradeProduct = 0.0;
    var gpa = 0.0;

    for(var i=0; i < myCourses.length; i++){
      var pGrade = myCourses[i].grade;
      var pHours = myCourses[i].credit;

      pEquiv = gradeEquiv(pGrade);

      pGradeProduct = pEquiv * pHours;
      pTotalHours += pHours;
      pTotalGradeProduct += pGradeProduct;
    };
    gpa = pTotalGradeProduct / pTotalHours;
    document.getElementById("gpa").innerHTML = gpa;
  }

  $scope.data = {
    showDelete: false
  };

  $scope.selectSem = function(semester, index){
    $scope.activeSemester = semester;
    Semesters.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);

    cgpa();
    gpa();

  };

  var selectSem1 = function(semester, index){
    $scope.activeSemester = semester;
    Semesters.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  $scope.onSemDelete = function(semester) {
    $scope.semesters.splice($scope.semesters.indexOf(semester), 1);
    Semesters.save($scope.semesters);
    $ionicSideMenuDelegate.toggleLeft(true);
  };

  $ionicModal.fromTemplateUrl('new-course.html', function(modal){
    $scope.courseModal = modal;
  }, {
    scope: $scope
  });

  $scope.createCourse = function(course){
    if(!$scope.activeSemester || !course){
      return;
    }
    $scope.activeSemester.courses.push({
      title: course.title,
      credit: course.credit,
      grade: course.grade
    });
    $scope.courseModal.hide();
    Semesters.save($scope.semesters);
    course.title = "";
    course.credit = "";
    course.grade = "";
  };

  $scope.deleteCourse = function(index){
    $scope.activeSemester.courses.splice(index, 1);
    Semesters.save($scope.semesters);
  };

  $scope.newCourse = function(){
    $scope.courseModal.show();
  };

  $scope.editCourse = function(){
    var lastSem = $scope.activeSemester.courses;
    var json_object = JSON.parse(localStorage["semesters"]);
    console.log(lastSem);
  }

  $scope.exitNewCourse = function(){
    $scope.courseModal.hide();
  };

  $scope.toggleSemesters = function(){
    $ionicSideMenuDelegate.toggleLeft();
  };

  $timeout(function(){
    if($scope.semesters.length == 0){
      while(true){
        var semName = prompt("Your first semester:");
        if(semName){
          createSemester(semName);
          break;
        }
      }
    }
  });

});

classMurphy.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
