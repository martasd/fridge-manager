"use strict";
exports.__esModule = true;
var unirest = require('unirest');
var functions = require('firebase-functions');
var dialogflow = require('actions-on-google').dialogflow;
var app = dialogflow();
// function Recipe(name: string, ingredients: string[]) {
//   this.name = name;
//   this.ingredients = ingredients;
// }
function presentRecipe(conv, number) {
    var chosenRecipe = conv.contexts.get('recipe-options').parameters[number];
    conv.user.storage.currentRecipe = chosenRecipe;
    conv.ask('Wonderful. Excellent choice! Would you like assistance with cooking ' +
        chosenRecipe.title +
        '?');
}
function redirectToCookingApp(conv) {
    var chosenRecipe = conv.user.storage.currentRecipe;
    conv.close('To enlist a cooking assistant to guide you while you cook, say: find me ' +
        chosenRecipe.title +
        ' to Google assistant after leaving this application. Bon appetit!');
}
function finish(conv) {
    conv.close('You must be a pro then. Good luck and bon appetit!');
}
function noRecipe(conv, single) {
    conv.close('Unfortunately, we have not found any ' +
        single +
        ' matching recipe for your ingredients. You might consider paying a visit to a grocery store.');
}
// How many recipes to select?
var maxSelectedNum = 3;
app.intent('WelcomeAndLearnIngredients', function (conv) {
    conv.ask('Welcome to Fridge Manager. Which ingredients do you have available? For example, you can say onion, potatoes, and salt.');
});
app.intent('MatchRecipes', function (conv, params) {
    var ingredients = params['ingredients'];
    console.log(ingredients);
    // Test recipes
    // let recipe1 = new Recipe('spaghetti with ketchup and cheese', [
    //   'spaghetti',
    //   'ketchup',
    //   'cheese',
    //   'garlic',
    //   'onion',
    //   'salt',
    //   'oil'
    // ]);
    // let recipe2 = new Recipe('schnitzel with potatoes', [
    //   'potatoes',
    //   'pork',
    //   'oil',
    //   'flour',
    //   'breadcrumbs',
    //   'eggs',
    //   'salt',
    //   'butter'
    // ]);
    // let recipe3 = new Recipe('risotto', [
    //   'rice',
    //   'corn',
    //   'carrot',
    //   'onion',
    //   'cheese',
    //   'olives',
    //   'mushrooms',
    //   'salt',
    //   'oil'
    // ]);
    // let recipe4 = new Recipe('pancakes', [
    //   'milk',
    //   'flour',
    //   'sugar',
    //   'eggs',
    //   'baking powder',
    //   'salt',
    //   'oil'
    // ]);
    // let recipes = [recipe1, recipe2, recipe3, recipe4];
    // Retrieve matched recipes from Spoonacular
    var getString = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients?number=3&ranking=1&ingredients=';
    ingredients.forEach(function (ingredient, index) {
        getString += ingredient;
        if (index != ingredients.length - 1) {
            getString += '%2C';
        }
    });
    console.log(getString);
    var selectedRecipes = [];
    var response = unirest
        .get(getString)
        .header('X-RapidAPI-Key', 'bcd6824181msh975176809d91b13p14cf9djsn709a7caa5d1c')
        .end(function (result) {
        console.log(result.status, result.headers, result.body);
        result.body.forEach(function (recipe) {
            selectedRecipes.push(recipe);
        });
    });
    // // Determine matched recipes
    // recipes.forEach(recipe => {
    //   let matchedIngredients = [];
    //   if (recipe.ingredients.length !== 0) {
    //     matchedIngredients = recipe.ingredients.filter(element => {
    //       return ingredients.indexOf(element) > -1;
    //     });
    //     if (matchedIngredients.length !== 0) {
    //       matchedRecipes.push(recipe);
    //     }
    //   }
    // });
    // Select the highest ranked recipes
    // let selectedRecipes = matchedRecipes.slice(0, maxSelectedNum);
    console.log('Recipes: ' + selectedRecipes);
    var selectedNum = selectedRecipes.length;
    var lastIndex = selectedNum - 1;
    var optionsQuery = '';
    var recipeOptions = {};
    if (selectedNum == 1) {
        recipeOptions[1] = selectedRecipes[0];
        optionsQuery +=
            'Your only option is: ' +
                selectedRecipes[0].title +
                '. Would you like to cook this one today?';
    }
    else {
        optionsQuery += 'These are your options: ';
        selectedRecipes.forEach(function (recipe, index, selectedRecipes) {
            // Save the retrieved recipes to context
            recipeOptions[index + 1] = recipe;
            // List the options to the user
            optionsQuery += recipe.title;
            if (index == lastIndex) {
                optionsQuery += '. ';
            }
            else if (index == lastIndex - 1) {
                optionsQuery += ', and ';
            }
            else {
                optionsQuery += ', ';
            }
        });
        optionsQuery += 'Which one would you like choose? Option ';
        for (var i = 0; i < selectedNum; i++) {
            // We start counting from 0, but most users start with 1:)
            optionsQuery += i + 1;
            if (i == lastIndex) {
                optionsQuery += '?';
            }
            else if (i == lastIndex - 1) {
                optionsQuery += ', or ';
            }
            else {
                optionsQuery += ', ';
            }
        }
    }
    if (selectedRecipes.length !== 0) {
        conv.contexts.set('recipe-options', 10, recipeOptions);
        conv.ask(optionsQuery);
    }
    else {
        // We don't have any possible recipes to offer
        noRecipe(conv, '');
    }
});
app.intent('PresentRecipe', function (conv, _a) {
    var number = _a.number;
    presentRecipe(conv, number);
});
app.intent('PresentSingleRecipe', function (conv) {
    presentRecipe(conv, 1);
});
app.intent('PresentNoRecipe', function (conv) {
    noRecipe(conv, 'other');
});
app.intent('RedirectToCookingApp', function (conv) {
    redirectToCookingApp(conv);
});
app.intent('Finish', function (conv) {
    finish(conv);
});
app.intent('RedirectSingleToCookingApp', function (conv) {
    redirectToCookingApp(conv);
});
app.intent('SingleFinish', function (conv) {
    finish(conv);
});
app.intent('Default Fallback Intent', function (conv) {
    conv.ask("I didn't catch that. Can you tell me something else?");
});
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
