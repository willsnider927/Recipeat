function openModal() 
{
    /* Note that you do NOT have to do a document.getElementById. Use the elements below */
    //user inputs
    var myInput = document.getElementById("psw");
    var confirmMyInput = document.getElementById("cpsw");
    var usrEmail = document.getElementById("usrEmail");
    var usrName = document.getElementById("usrName");
    //error messages
    var letter = document.getElementById("letter");
    var capital = document.getElementById("capital");
    var number = document.getElementById("number");
    var symbol = document.getElementById("symbol"); 
    var length = document.getElementById("length");
    var match = document.getElementById("match");
    var mail = document.getElementById("mail");
    //message blocks
    var passMsg = document.getElementById("passMsg");
    var mailMsg = document.getElementById("mailMsg");
    var confMsg = document.getElementById("confMsg");


    usrName.onkeyup = function() {enableButton(letter, capital, number, length, match, mail, symbol, usrName)};
    myInput.onkeyup = function () {
      passMsg.style="display: block"
      var lowerCaseLetters = /[a-z]/g; //regular expression for lowerCaseLetters
      var upperCaseLetters = /[A-Z]/g; //regular expression for upperCaseLetters
      var numbers = /[0-9]/g; //regular expression for digits
      var symbols = /[!-/]|[:-@]|[\[-`]|[{-~]/g; //regular expression for symbols
      var minLength = 12; //min length
      
      // Validate lowercase letters
      if (myInput.value.match(lowerCaseLetters)) 
      {
        letter.classList.remove("invalid");
        letter.classList.add("valid");
      } 
      else 
      {
        letter.classList.remove("valid");
        letter.classList.add("invalid");
      }
  
      // Validate capital letters
      if (myInput.value.match(upperCaseLetters)) 
      {
        capital.classList.remove("invalid");
        capital.classList.add("valid");
      } 
      else 
      {
        capital.classList.remove("valid");
        capital.classList.add("invalid");
      }
  
      // Validate numbers
      if (myInput.value.match(numbers)) 
      {
        number.classList.remove("invalid");
        number.classList.add("valid");
      } 
      else 
      {
        number.classList.remove("valid");
        number.classList.add("invalid");
      }
  
      // Validate symbols
      if (myInput.value.match(symbols)) 
      {
        symbol.classList.remove("invalid");
        symbol.classList.add("valid");
      } 
      else 
      {
        symbol.classList.remove("valid");
        symbol.classList.add("invalid");
      }
  
      // Validate length
      if (myInput.value.length >= minLength) 
      {
        length.classList.remove("invalid");
        length.classList.add("valid");
      } 
      else 
      {
        length.classList.remove("valid");
        length.classList.add("invalid");
      }
      // Validate password and confirmPassword
      var passEqualsConfPass = myInput.value === confirmMyInput.value && myInput.value.length;
      if (passEqualsConfPass) 
      {
        match.classList.remove("invalid");
        match.classList.add("valid");
      } 
      else 
      {
        match.classList.remove("valid");
        match.classList.add("invalid");
      }
  
      // rough fix to have passMsg go to display: none
      if (letter.classList.contains("valid") &&capital.classList.contains("valid") && number.classList.contains("valid") && length.classList.contains("valid") && symbol.classList.contains("valid"))
      {
        passMsg.style="display: none"
        enableButton(letter, capital, number, length, match, mail, symbol, usrName);
      }
    };
    confirmMyInput.onkeyup = function () 
    {
      // Validate password and confirmPassword
      var passEqualsConfPass = myInput.value === confirmMyInput.value && myInput.value.length;
      if (passEqualsConfPass) 
      {
        match.classList.remove("invalid");
        match.classList.add("valid");
        confMsg.style="display: none"
      } 
      else 
      {
        match.classList.remove("valid");
        match.classList.add("invalid");
        confMsg.style="display: block"
      }
  
      // Disable or Enable the button based on the elements in classList
      enableButton(letter, capital, number, length, match, mail, symbol, usrName);
    };
    usrEmail.onkeyup = function() 
    {
      var email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g;
      // Validate email
      if (usrEmail.value.match(email)) 
      {
        mail.classList.remove("invalid");
        mail.classList.add("valid");
        mailMsg.style="display: none"
      }
      else 
      {
        mail.classList.remove("valid");
        mail.classList.add("invalid");
        mailMsg.style="display: block"
      }
      enableButton(letter, capital, number, length, match, mail, symbol, usrName);
    };
  }

  function forgotPass() 
  {
    var forgotMail = document.getElementById("forgotMail");
    var button = docuent.getElementById("forgot_submit");
    var email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g
    if (forgotMail.value.match(email))
    {
      button.disabled = false;
      button.setAttribute("action","onClickForgot()");
    }
    else button.disabled = true;
  }

  function onClickForgot()
  {
    alert("function disabled, remember your passwords");
  }
  
  function enableButton(letter, capital, number, length, match, mail, symbol, usrName) 
  {
    var button = document.getElementById("my_submit_button");
    var condition = (letter.classList.contains("valid") &&capital.classList.contains("valid") && number.classList.contains("valid") && length.classList.contains("valid") && match.classList.contains("valid") && mail.classList.contains("valid") && symbol.classList.contains("valid"));
    if (usrName.value.length > 0 && condition) 
    {
      button.disabled = false;
      button.setAttribute("action", "/register")
      button.setAttribute("method", "post")
    }
    else button.disabled = true;
  }
  