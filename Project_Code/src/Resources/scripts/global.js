//sidebar js written by Jason
function openNav() {
    document.getElementById("sidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.getElementById("content").style.marginRight = "250px";
    document.getElementById("collapseIcon").classList.remove('fa-angles-right');
    document.getElementById("collapseIcon").classList.add('fa-angles-left');
    document.getElementById("collapse").setAttribute( "onclick", "javascript: closeNav()" );
}

function closeNav() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0px";
    document.getElementById("content").style.marginRight = "0px";
    document.getElementById("collapseIcon").classList.remove('fa-angles-left');
    document.getElementById("collapseIcon").classList.add('fa-angles-right');
    document.getElementById("collapse").setAttribute( "onclick", "javascript: openNav();" );
}

window.addEventListener("resize", function() {
    if (window.matchMedia("(min-width: 800px)").matches) {
      console.log("Screen width is at least 500px")
    } else {
        closeNav();
    }
  })

const recipesMap = new Map();
function openRecipeModal(info, action) {
    if (action === 'random') info = JSON.parse(info);
    var title = document.getElementById("recipe_title");
    var image = document.getElementById("recipe_image");
    var ingredients = document.getElementById("recipe_ingredients");
    var instructions = document.getElementById("recipe_instructions");
    var prepTime = document.getElementById("recipe_prepTime");
    var servings = document.getElementById("recipe_servings");
    var recipe_action = document.getElementById("recipe_action");

    title.innerHTML = info.title;
    image.src = info.image;
    prepTime.innerHTML = "Prep Time: " + info.readyInMinutes;
    servings.innerHTML = "Servings: " +info.servings;
    instructions.innerHTML = ""
    ingredients.innerHTML = ""
    info.extendedIngredients.forEach(ingredient => {
        ingredients.innerHTML += `<li>${ingredient.name}</li>`;
    });
    info.analyzedInstructions[0].steps.forEach(instruction => {
        instructions.innerHTML += `<li>${instruction.step}</li>`;
    });
    if (action === "remove") {
        recipe_action.innerHTML = "Remove from Favorites";
        recipe_action.setAttribute("onclick", "javascript: removeFromFavorites('" + info.id + "')");
        recipe_action.style.backgroundColor = "red";
    } else {
        recipe_action.innerHTML = "Add to Favorites";
        recipe_action.setAttribute("onclick", "javascript: addToFavorites('" + info.id + "')");
        recipe_action.style.backgroundColor = "green";
    }
}

function addToFavorites(id) {
    $.ajax({
        url: window.location.origin + "/add_favorite" + id,
        type: "get",
        success: res => {
            if (res.success) {
                alert("Recipe added to favorites!");
            } else {
                alert("Error adding recipe to favorites!");
            }
        },
        error: err => {
            console.log(err)
            alert("Error adding recipe to favorites!");
        }
    });
}

function removeFromFavorites(id) {
    $.ajax({
        url: window.location.origin+ "/remove_favorite" + id,
        type: "get",
        success: res => {
            if (res.success) {
                window.location.reload();
            } else {
                alert("Error removing recipe from favorites!");
            }
        },
        error: err => {
            console.log(err)
            alert("Error removing recipe from favorites!");
        }
    });
}

