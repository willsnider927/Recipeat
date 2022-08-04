$('#random_button').click(function() {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/random?number=9&instructionsRequired=true",
        "method": "GET",
        "headers": {
            "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
            "X-RapidAPI-Key": `89765daf39msh18621cac397b13cp1dcac6jsnc085f89d2e27`
        }
    };
    
    $.ajax(settings).done(function (response) {
        if (response.recipes.length > 0) {
            $('#random_populate').empty();
            for (var recipe in response.recipes) {
                recipesMap.set(response.recipes[recipe].id, JSON.stringify(response.recipes[recipe]));
                $('#random_populate').append(`
                <div class="card col-3 recipe-card" id="${response.recipes[recipe].id}" onclick="openRecipeModal(recipesMap.get(${response.recipes[recipe].id}), 'random')" data-toggle="modal" data-target="#recipe_modal">
                    <img class="card-img-top" src="${response.recipes[recipe].image}" alt="${response.recipes[recipe].title} image">
                    <div class="card-body">
                        <div class="card-title"> ${response.recipes[recipe].title} </div>
                        <p class="card-text"> Prep Time: ${response.recipes[recipe].readyInMinutes} Minutes</p>
                    </div>
                </div>
                `);
            }
        }
    });
});