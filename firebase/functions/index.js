const functions = require('firebase-functions')

const {
  dialogflow,
} = require('actions-on-google')

const app = dialogflow()

function Recipe(name, ingredients) {
    this.name = name;
    this.ingredients = ingredients;
}

// How many recipes to select?
const maxSelectedNum = 3;

app.intent('WelcomeAndLearnIngredients', (conv) => {
    conv.ask('Welcome to Fridge Manager. Which ingredients do you have available? For example, you can say onion, potatoes, and pineapple.');
})

app.intent('RecipeMatching', (conv, {ingredients}) => {
    console.log(ingredients);
    
    // Test recipes
    let recipe1 = new Recipe('spaghetti with ketchup and cheese', ['spaghetti','ketchup', 'cheese', 'garlic', 'onion', 'salt', 'oil']);
    let recipe2 = new Recipe('schnitzel with potatoes', ['potatoes', 'pork', 'oil', 'flour', 'breadcrumbs', 'eggs', 'salt', 'butter']);
    let recipe3 = new Recipe('risotto', ['rice', 'corn', 'carrot', 'onion', 'cheese', 'olives', 'mushrooms', 'salt', 'oil']);
    let recipe4 = new Recipe('pancakes', ['milk', 'flour', 'sugar', 'eggs', 'baking powder', 'salt', 'oil']);
    let recipes = [ recipe1, recipe2, recipe3, recipe4 ];
    
    let matchedRecipes = [];
    
    // Determine matched recipes
    recipes.forEach(function(recipe) { 
        
        let matchedIngredients = [];
        if (recipe.ingredients.length !== 0) {
            matchedIngredients = recipe.ingredients.filter(function(element) {
            return ingredients.indexOf(element) > -1;
            });
        
            if (matchedIngredients.length !== 0) {
                matchedRecipes.push(recipe);
            }
        }
    });

    // Select the highest ranked recipes
    let selectedRecipes = matchedRecipes.slice(0, maxSelectedNum);
    let selectedNum = selectedRecipes.length;
    let lastIndex = selectedNum - 1;
    
    let recipeOptions = {};
    let optionsQuery = 'These are your options: ';
    selectedRecipes.forEach(function(recipe, index, selectedRecipes) {
        // Save the retrieved recipes to context
        recipeOptions[index+1] = recipe;
        
        // List the options to the user
        optionsQuery += recipe.name;
        
        if (index == lastIndex) {
            optionsQuery += '. ';
        }
        else if (index == lastIndex-1)  {
            optionsQuery += ', and ';
        }
        else {
            optionsQuery += ', ';
        }
    })
    optionsQuery += 'Which one would you like choose? Option '
    
    for (let i = 0; i < selectedNum; i++) {
         
        // We start counting from 0, but most users start with 1:)
        optionsQuery += i+1;

        if (i == lastIndex) {
            optionsQuery += '?';
        }
        else if (i == lastIndex-1)  {
            optionsQuery += ', or ';
        }
        else {
            optionsQuery += ', ';
        }
    }

    if (selectedRecipes.length !== 0) {
        conv.contexts.set('recipe-options', 10, recipeOptions);
        conv.ask(optionsQuery);
    }
    else {
        // We don't have any possible recipes to offer 
        conv.close('Unfortunately, we have not found any matching recipe for your ingredients. You might consider paying a visit to a grocery store.');
    }
})

app.intent('PresentRecipe', (conv, {number}) => {
    let chosenRecipe = conv.contexts.get('recipe-options').parameters[number];
    conv.user.storage.currentRecipe = chosenRecipe;
    conv.ask('Wonderful. Excellent choice! Would you like assistance with cooking ' + chosenRecipe.name + '?');
})

app.intent('RedirectToCookingAssistant', (conv) => {
    let chosenRecipe = conv.user.storage.currentRecipe;
    conv.close('Say: find me ' + chosenRecipe.name + 'to Google assistant after leaving this application. Bon appetit!');
})

app.intent('NoCookingAssistant', (conv) => {
    conv.close('You must be a pro then. Good luck and goodbye!');
})

app.intent('Default Fallback Intent', conv => {
  conv.ask(`I didn't catch that. Can you tell me something else?`)
})

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app)