function addModal(){
    var meat = document.getElementById("addItemM");
    var carbs = document.getElementById("addItemC");
    var vegs = document.getElementById("addItemV");
    var dairy = document.getElementById("addItemD");
    var dairy = document.getElementById("addItemF");
    var input = false;
    meat.onkeyup = function () {
      var minLength = 1; //min length
      if (meat.value.length >= minLength) 
      {
        input = true;
      }
        addEnableBtn(input);
    };
    carbs.onkeyup = function () {
        var minLength = 1; //min length
        if (carbs.value.length >= minLength) 
        {
          input = true;
        }
        addEnableBtn(input);
    };
    vegs.onkeyup = function () {
      var minLength = 1; //min length
      if (vegs.value.length >= minLength) 
      {
        input = true;
      }
        addEnableBtn(input);
    };
    dairy.onkeyup = function () {
        var minLength = 1; //min length
        if (dairy.value.length >= minLength) 
        {
          input = true;
        }
        addEnableBtn(input);
    };
    fruit.onkeyup = function () {
        var minLength = 1; //min length
        if (fruit.value.length >= minLength) 
        {
          input = true;
        }
        addEnableBtn(input);
    };
      
}
  
function addEnableBtn(inputs){
    if(inputs == true){
        var button = document.getElementById("add_submit_button");
        button.disabled = false;
        button.setAttribute("action", "/add")
        button.setAttribute("method", "post")
    }  
}

function deleteModal(){
    var meat = document.getElementById("rItemM");
    var carbs = document.getElementById("rItemC");
    var vegs = document.getElementById("rItemV");
    var dairy = document.getElementById("rItemD");
    var dairy = document.getElementById("rItemF");
    var input = false;
    meat.onkeyup = function () {
      var minLength = 1; //min length
      if (meat.value.length >= minLength) 
      {
        input = true;
      }
        removeEnableBtn(input);
    };
    carbs.onkeyup = function () {
        var minLength = 1; //min length
        if (carbs.value.length >= minLength) 
        {
          input = true;
        }
        removeEnableBtn(input);
    };
    vegs.onkeyup = function () {
      var minLength = 1; //min length
      if (vegs.value.length >= minLength) 
      {
        input = true;
      }
        removeEnableBtn(input);
    };
    dairy.onkeyup = function () {
        var minLength = 1; //min length
        if (dairy.value.length >= minLength) 
        {
          input = true;
        }
        removeEnableBtn(input);
    };
    fruit.onkeyup = function () {
        var minLength = 1; //min length
        if (fruit.value.length >= minLength) 
        {
          input = true;
        }
        removeEnableBtn(input);
    };    
}

function removeEnableBtn(inputs){
    if(inputs == true){
        var button = document.getElementById("remove_submit_button");
        button.disabled = false;
        button.setAttribute("action", "/remove")
        button.setAttribute("method", "post")
    }  
}