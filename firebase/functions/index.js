const functions = require('firebase-functions')

const {
  dialogflow,
} = require('actions-on-google')

const app = dialogflow()

function Recipe(name, ingredients) {
    this.name = name;
    this.ingredients = ingredients;
}

app.intent('WelcomeAndLearnIngredients', (conv) => {
    conv.ask('Welcome to Fridge Manager. Which ingredients do you have available? For example, you can say onion, potatoes, and pineapple.');
})

app.intent('RecipeMatching', (conv, {ingredients}) => {
    console.log(ingredients);
    
    let recipe1 = new Recipe('spaghetti with ketchup and cheese', ['spaghetti','ketchup', 'cheese', 'garlic', 'onion', 'salt', 'oil']);
    let recipe2 = new Recipe('schnitzel with potatoes', ['potatoes', 'pork', 'oil', 'flour', 'breadcrumbs', 'eggs', 'salt', 'butter']);
    let recipe3 = new Recipe('risotto', ['rice', 'corn', 'carrot', 'onion', 'cheese', 'olives', 'mushrooms', 'salt', 'oil']);
    
    let recipes = [ recipe1, recipe2, recipe3 ];
    
    let matchedRecipes = [];
    
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

    console.log(matchedRecipes);
    conv.contexts.set('recipe-options', 10, {"1": recipe1, "2": recipe2, "3": recipe3});
    conv.ask('These are your options. ' + recipe1.name + ', ' + recipe2.name + ', or ' + recipe3.name + '? Would you like number 1, 2, or 3?');
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