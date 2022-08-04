
/* 

Working ajax call for search recipes without pantry ingredients written by Ryan and Jason

$('#keyWordForm').click( function() {
  var keyUp = document.querySelector("[data-search]");
  //var searchInput = "";
  //searchInput = keyUp.val();
  //console.log(keyUp.val());
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search?query=chicken`,
    "method": "GET",
    "headers": {
      "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
      "X-RapidAPI-Key": "89765daf39msh18621cac397b13cp1dcac6jsnc085f89d2e27"
    }
  };
  
  $.ajax(settings).done(function (response) {
    console.log(response);
    if (response.results.length > 0) {
      for (var recipe in response.results) {
          $('#searchUL').append(`<li>
                      <div="card">
                          <img src="${response.baseUri}${response.results[recipe].image}" alt="Recipe Picture">
                          <p class="card-body">${response.results[recipe].title}</p>
                      </div>
          </li>`);
      }
    }
  })
  
  .catch(function (error) {
      console.error(error);
  })
});

*/

// JS to add to css for animation
$('.search-bar-div').mouseenter(function () {
  $(this).css({width: '20em', cursor: 'pointer'});
  $('#search_bar').css({display: 'block'});
});

$('.fa').mouseenter(function () {
  $(this).css({background: 'transparent', color: 'red'});
});

/*
$('.search-bar-form').submit(function(e) {
  e.preventDefault();
});

$('.search-filter-form').submit(function(e) {
  e.preventDefault();
});

$('.form-check').submit(function(e) {
  e.preventDefault();
});
*/

if (!log) {
  $('#checkbox_label').append(" (Only for logged in users)");
  $('#include_ingrediants').attr('disabled', 'disabled');
}